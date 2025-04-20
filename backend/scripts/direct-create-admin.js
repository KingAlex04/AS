require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdminDirectly() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGO_URI || 'mongodb+srv://hrmtracker:hrmtracker123@hrmtracker.mongodb.net/hrm-tracker?retryWrites=true&w=majority';
    console.log('Connecting to MongoDB:', uri);
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000
    });
    
    console.log('Connected to MongoDB');
    
    // Define a simple schema for user (without requiring the model file)
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      active: Boolean,
      createdAt: {
        type: Date,
        default: Date.now
      }
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Check if admin already exists
    console.log('Checking if admin exists...');
    const adminExists = await User.findOne({ email: 'laxmisah988@gmail.com' });
    
    if (adminExists) {
      console.log('Admin user found:', adminExists);
      
      // Update to admin role
      adminExists.role = 'admin';
      
      // Update admin password
      const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
      adminExists.password = hashedPassword;
      adminExists.active = true;
      
      await adminExists.save();
      console.log('Admin user updated successfully:', {
        name: adminExists.name,
        email: adminExists.email,
        role: adminExists.role
      });
    } else {
      console.log('Admin not found, creating new admin user...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
      
      // Create admin user
      const newAdmin = new User({
        name: 'Admin User',
        email: 'laxmisah988@gmail.com',
        password: hashedPassword,
        role: 'admin',
        active: true
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully:', {
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      });
    }
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in admin script:', error);
    process.exit(1);
  }
}

createAdminDirectly(); 