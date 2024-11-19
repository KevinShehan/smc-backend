import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import multer from 'multer';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';


// import userRoutes from './routes/User.route.js';
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Multer configuration
// Multer setup for image uploads
const upload = multer({ dest: 'uploads/' });
// Routes
// app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`)
})

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/smcnoode")
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB")
    });

// User schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
    imagePath: String,
    qrCodePath: String,
});

// Password encryption
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
const User = mongoose.model('User', userSchema);

// JWT strategy for Passport
passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id);
          if (user) return done(null, user);
          return done(null, false);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

// Middleware for role-based access
const authorize = roles => (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user || !roles.includes(user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = user;
      next();
    })(req, res, next);
  };

  // Routes
// 1. Register
app.post('/register', upload.single('image'), async (req, res) => {
    const { name, email, password, role } = req.body;
    const imagePath = req.file ? req.file.path : null;
  
    try {
      const qrCodePath = `uploads/qr_${Date.now()}.png`;
      await QRCode.toFile(qrCodePath, `Name: ${name}, Email: ${email}`);
  
      const newUser = new User({ name, email, password, role, imagePath, qrCodePath });
      await newUser.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // 2. Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
// 3. CRUD for Teachers (Example)
app.get('/teachers', authorize(['admin', 'teacher']), async (req, res) => {
    try {
      const teachers = await User.find({ role: 'teacher' });
      res.json(teachers);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  app.post('/teachers', authorize(['admin']), async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
      const newTeacher = new User({ name, email, password, role: 'teacher' });
      await newTeacher.save();
      res.status(201).json({ message: 'Teacher added successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  app.put('/teachers/:id', authorize(['admin']), async (req, res) => {
    try {
      const updatedTeacher = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedTeacher);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  
  app.delete('/teachers/:id', authorize(['admin']), async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'Teacher deleted successfully' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });