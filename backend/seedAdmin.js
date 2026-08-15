const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();


const User = require("./models/User");


const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);


        console.log("MongoDB connected");


        const existingAdmin = await User.findOne({
            email: "admin@gov.demo"
        });


        if (existingAdmin) {
            console.log("Government admin already exists");
            process.exit(0);
        }


        const passwordHash = await bcrypt.hash(
            "Admin123456",
            10
        );


        await User.create({
            name: "Government Admin",
            email: "admin@gov.demo",
            passwordHash,
            role: "government"
        });


        console.log("Government admin created");


        process.exit(0);


    } catch (error) {
        console.error("Failed to create admin:", error.message);
        process.exit(1);
    }
};


createAdmin();
