
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
    // ELECTRONICS
    {
        name: "Wireless Bluetooth Headphones",
        description: "Comfortable wireless headphones with clear sound and long battery life.",
        price: 1499,
        category: "Electronics",
        brand: "SoundMax",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        stock: 25,
        isFeatured: true,
    },
    {
        name: "Smart Watch Series 5",
        description: "Modern smartwatch with fitness tracking and notification support.",
        price: 2499,
        category: "Electronics",
        brand: "TechPro",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        stock: 18,
        isFeatured: true,
    },
    {
        name: "Wireless Gaming Mouse",
        description: "Ergonomic wireless mouse designed for gaming and productivity.",
        price: 899,
        category: "Electronics",
        brand: "GameX",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600",
        stock: 30,
    },
    {
        name: "Modern Laptop",
        description: "Slim and lightweight laptop suitable for work, study and entertainment.",
        price: 45999,
        category: "Electronics",
        brand: "TechPro",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
        stock: 10,
    },

    // FASHION
    {
        name: "Classic Cotton T-Shirt",
        description: "Comfortable everyday cotton t-shirt with a clean modern design.",
        price: 499,
        category: "Fashion",
        brand: "UrbanWear",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
        stock: 50,
        isFeatured: true,
    },
    {
        name: "Casual Denim Jacket",
        description: "Stylish denim jacket suitable for casual everyday outfits.",
        price: 1799,
        category: "Fashion",
        brand: "DenimCo",
        image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600",
        stock: 20,
    },
    {
        name: "Running Sneakers",
        description: "Lightweight sneakers designed for walking, running and daily use.",
        price: 2199,
        category: "Fashion",
        brand: "StepUp",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        stock: 22,
        isFeatured: true,
    },

    // HOME & LIVING
    {
        name: "Modern Table Lamp",
        description: "Elegant table lamp to add warm lighting to your living space.",
        price: 1199,
        category: "Home & Living",
        brand: "HomeStyle",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
        stock: 15,
    },
    {
        name: "Decorative Indoor Plant",
        description: "Beautiful indoor greenery for decorating your home or office.",
        price: 399,
        category: "Home & Living",
        brand: "GreenNest",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600",
        stock: 35,
    },

    // ACCESSORIES
    {
        name: "Classic Wrist Watch",
        description: "Elegant wrist watch with a minimalist dial and comfortable strap.",
        price: 1599,
        category: "Accessories",
        brand: "TimeCraft",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
        stock: 16,
    },
    {
        name: "Premium Backpack",
        description: "Spacious everyday backpack suitable for college, travel and work.",
        price: 999,
        category: "Accessories",
        brand: "TravelMate",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        stock: 28,
        isFeatured: true,
    },

    // BEAUTY
    {
        name: "Skincare Essentials Set",
        description: "A convenient skincare collection for your daily personal care routine.",
        price: 799,
        category: "Beauty",
        brand: "GlowCare",
        image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600",
        stock: 24,
    },
    {
        name: "Perfume Collection",
        description: "A refreshing fragrance collection for everyday occasions.",
        price: 1299,
        category: "Beauty",
        brand: "AromaPlus",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600",
        stock: 20,
    },

    // SPORTS
    {
        name: "Professional Football",
        description: "Durable football suitable for training and recreational matches.",
        price: 699,
        category: "Sports",
        brand: "SportZone",
        image: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0e7e?w=600",
        stock: 30,
    },
    {
        name: "Fitness Dumbbells",
        description: "Compact exercise dumbbells for strength training at home.",
        price: 899,
        category: "Sports",
        brand: "FitLife",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600",
        stock: 18,
    },
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB.");

        let inserted = 0;
        let existing = 0;

        for (const product of products) {
            const result = await Product.updateOne(
                {
                    name: product.name,
                    category: product.category,
                },
                {
                    $setOnInsert: product,
                },
                {
                    upsert: true,
                }
            );

            if (result.upsertedCount > 0) {
                inserted++;
            } else {
                existing++;
            }
        }

        console.log(`Products inserted: ${inserted}`);
        console.log(`Products already existed: ${existing}`);
        console.log("Product seeding completed successfully.");
    } catch (error) {
        console.error("Product seeding failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();
