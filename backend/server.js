const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const governmentRoutes = require("./routes/governmentRoutes");

const app = express();

// Allow requests from the Next.js frontend
app.use(
    cors({
        origin: "http://localhost:3000"
    })
);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/government", governmentRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "Dome backend is running"
    });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });