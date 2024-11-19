import express from 'express';
import multer from 'multer';

const router = express.Router();

// Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Routes
router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.get('/protected', protect, getProtectedData);
router.get('/admin-only', protect, adminOnly, getProtectedData);


export default router;