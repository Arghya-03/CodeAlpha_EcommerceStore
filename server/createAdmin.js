
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminEmail = "admin@shopnest.com";
        const adminPassword = "@@Pupun2025";

        const existingAdmin = await User.findOne({
            email: adminEmail,
        });

        if (existingAdmin) {
            if (existingAdmin.role === "admin") {
                console.log("Admin account already exists.");
            } else {
                console.log("This email already belongs to a customer.");
                console.log("Choose a different admin email.");
            }

            return;
        }

        await User.create({
            name: "ShopNest Admin",
            email: adminEmail,
            password: adminPassword,
            role: "admin",
        });

        console.log("Admin account created successfully!");
        console.log("Email:", adminEmail);
        console.log("Use the password configured in createAdmin.js");
    } catch (error) {
        console.error("Admin creation failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();
