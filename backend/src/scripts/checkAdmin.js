const mongoose = require('mongoose');
const User = require('../models/UserModel');
require('dotenv').config();

async function checkAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin exists
    const admin = await User.findOne({ email: 'admin_12@iitp.ac.in' }).select('+password');
    if (admin) {
      console.log('Admin user found:');
      console.log('ID:', admin._id);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Name:', admin.name);
      console.log('Roll No:', admin.rollNo);

      // Test password comparison
      const isMatch = await admin.comparePassword('admin123');
      console.log('Password match:', isMatch);
    } else {
      console.log('Admin user not found');
    }

  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

checkAdmin();
