
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

async function fixImage() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await Product.updateOne(
      { name: "Professional Football" },
      {
        $set: {
          image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600",
        },
      }
    );

    console.log("Football image updated:", result.modifiedCount);
  } catch (error) {
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixImage();
