const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Standalone script to create admin user regardless of server setup
async function createAdminStandalone() {
  console.log('Starting standalone admin user creation process...');
  console.log('===============================================');
  
  try {
    // Connection URL - try multiple possible URLs
    const uris = [
      process.env.MONGO_URI,
      'mongodb+srv://hrmtracker:hrmtracker123@hrmtracker.mongodb.net/hrm-tracker?retryWrites=true&w=majority',
      'mongodb://localhost:27017/hrm-tracker'
    ].filter(Boolean);
    
    let connected = false;
    let connection;
    
    // Try each connection string
    for (const uri of uris) {
      try {
        console.log(`Attempting to connect to: ${uri}`);
        connection = await mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000,
          connectTimeoutMS: 10000
        });
        connected = true;
        console.log('Connected successfully to MongoDB');
        break;
      } catch (err) {
        console.error(`Failed to connect to ${uri}:`, err.message);
      }
    }
    
    if (!connected) {
      throw new Error('Failed to connect to any MongoDB instance');
    }
    
    // Define a simple user schema
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
    }, { strict: false });
    
    // Remove any existing model to prevent errors
    if (mongoose.models.User) {
      delete mongoose.models.User;
    }
    
    const User = mongoose.model('User', userSchema);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Check if admin user exists
    const admin = await User.findOne({ email: 'laxmisah988@gmail.com' });
    
    if (admin) {
      console.log('Admin user found, updating...');
      console.log('Current admin data:', admin);
      
      // Update the admin
      const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
      admin.password = hashedPassword;
      admin.role = 'admin';
      admin.active = true;
      
      await admin.save();
      console.log('Admin user updated successfully');
    } else {
      console.log('Admin user not found, creating new admin...');
      
      // Hash password
      const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
      
      // Create a new admin user
      const newAdmin = new User({
        name: 'Admin User',
        email: 'laxmisah988@gmail.com',
        password: hashedPassword,
        role: 'admin',
        active: true,
        createdAt: new Date()
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully');
    }
    
    // Direct collection approach as backup
    try {
      const usersCollection = mongoose.connection.db.collection('users');
      const adminInCollection = await usersCollection.findOne({ email: 'laxmisah988@gmail.com' });
      
      console.log('Admin in collection direct check:', adminInCollection ? 'Found' : 'Not found');
      
      if (!adminInCollection) {
        console.log('Creating admin directly in collection...');
        const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
        
        await usersCollection.insertOne({
          name: 'Admin User',
          email: 'laxmisah988@gmail.com',
          password: hashedPassword,
          role: 'admin',
          active: true,
          createdAt: new Date()
        });
        
        console.log('Admin created directly in collection');
      }
    } catch (collErr) {
      console.error('Collection manipulation error:', collErr.message);
    }
    
    // Final confirmation
    const confirmAdmin = await User.findOne({ email: 'laxmisah988@gmail.com' });
    console.log('Admin user confirmation:', confirmAdmin ? 'Exists' : 'Not found');
    
    if (confirmAdmin) {
      console.log('Admin details:');
      console.log('- Name:', confirmAdmin.name);
      console.log('- Email:', confirmAdmin.email);
      console.log('- Role:', confirmAdmin.role);
      console.log('- Active:', confirmAdmin.active);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    console.log('===============================================');
    console.log('ADMIN USER READY FOR LOGIN:');
    console.log('Email: laxmisah988@gmail.com');
    console.log('Password: Laxmi@1234#');
    console.log('===============================================');
    
    return true;
  } catch (error) {
    console.error('Error in admin creation script:', error);
    
    if (mongoose.connection) {
      await mongoose.connection.close().catch(console.error);
      console.log('MongoDB connection closed after error');
    }
    
    return false;
  }
}

// Run the function
createAdminStandalone().then(success => {
  console.log('Script completed with ' + (success ? 'success' : 'failure'));
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 