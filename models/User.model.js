import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = mongoose.model("UserSchema",{
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    image: { type: String }, // Path to uploaded image
    qrCode: { type: String }, // Path to QR code

},{
    timestamps: true
});

export default mongoose.model('User', userSchema);