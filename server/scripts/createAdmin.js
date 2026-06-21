const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const createAdmin = async () => {
  const args = process.argv.slice(2);
  const username = args[0];
  const password = args[1];

  if (!username || !password) {
    console.error("Usage: node scripts/createAdmin.js <username> <password>");
    process.exit(1);
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("Error: MONGODB_URI is not defined in backend .env file");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully.");

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      console.error(`Error: User with username "${username}" already exists.`);
      mongoose.connection.close();
      process.exit(1);
    }

    // Create user (hashing handled by schema pre-save hook)
    await User.create({
      username: username.trim(),
      password: password,
    });

    console.log("-----------------------------------------");
    console.log(`SUCCESS: Admin user "${username}" created!`);
    console.log("-----------------------------------------");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      mongoose.connection.close();
    }
    process.exit(1);
  }
};

createAdmin();
