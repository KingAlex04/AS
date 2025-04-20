require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hrm-tracker';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'laxmisah988@gmail.com' });
    if (adminExists) {
      console.log('Admin user already exists');
      if (adminExists.role !== 'admin') {
        // Update to admin role if not already
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('User updated to admin role');
      }
      
      // Update admin password
      const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log('Admin password updated');
      
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
    
    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'laxmisah988@gmail.com',
      password: hashedPassword,
      role: 'admin',
      active: true
    });
    
    console.log('Admin user created successfully:');
    console.log({
      name: admin.name,
      email: admin.email,
      role: admin.role
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin(); 