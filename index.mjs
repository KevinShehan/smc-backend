import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const app = express();
app.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`)
})

// Connect to MongoDB
mongoose.connect("localhost:27100/smc",)
.then(() => {
    console.log("Connected to MongoDB")
})
.catch((error) => {
    console.error("Error connecting to MongoDB")
})