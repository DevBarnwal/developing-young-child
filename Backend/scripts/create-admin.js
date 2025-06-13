// Script to create or update a user to admin role
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

// Parse command line args for email
const args = process.argv.slice(2);
const email = args[0];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: node scripts/create-admin.js user@example.com');
  process.exit(1);
}

const makeAdmin = async () => {
  try {
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    // Update to admin role
    user.role = 'admin';
    await user.save();
    
    console.log(`User ${email} has been updated to admin role`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Run the function
makeAdmin();
