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