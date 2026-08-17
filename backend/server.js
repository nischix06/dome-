const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const governmentRoutes = require("./routes/governmentRoutes");

const app = express();

app.use(cors());

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

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });