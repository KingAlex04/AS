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
      serverSelectionTimeoutMS: 60000, // Increase timeout to 60 seconds
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000
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
    }, { strict: false }); // Set strict to false to allow any fields
    
    // Add compare password method to the schema
    userSchema.methods.comparePassword = async function(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };
    
    // Remove the model if it's already defined (prevents OverwriteModelError)
    mongoose.models = {};
    const User = mongoose.model('User', userSchema);
    
    // Check if admin already exists
    console.log('Checking if admin exists...');
    
    try {
      // List all collections first to verify database structure
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Collections in database:', collections.map(c => c.name).join(', '));
      
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
          id: adminExists._id,
          name: adminExists.name,
          email: adminExists.email,
          role: adminExists.role
        });
      } else {
        // Check if users collection exists
        const usersCollectionExists = collections.some(c => c.name === 'users');
        if (!usersCollectionExists) {
          console.log('Users collection does not exist. Creating collection...');
        }
        
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
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role
        });
      }
      
      // Test logging in with the admin user
      console.log('Testing admin login...');
      const adminUser = await User.findOne({ email: 'laxmisah988@gmail.com' });
      if (adminUser) {
        const passwordMatch = await adminUser.comparePassword('Laxmi@1234#');
        console.log('Password match test:', passwordMatch ? 'SUCCESSFUL' : 'FAILED');
        
        if (!passwordMatch) {
          // If password test fails, force update the password
          console.log('Forcing password update...');
          adminUser.password = await bcrypt.hash('Laxmi@1234#', 10);
          await adminUser.save();
          console.log('Password updated forcefully');
        }
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Try a different approach if the model approach fails
      console.log('Attempting direct collection manipulation...');
      
      try {
        const usersCollection = mongoose.connection.db.collection('users');
        
        // Check if admin exists
        const adminUser = await usersCollection.findOne({ email: 'laxmisah988@gmail.com' });
        
        if (adminUser) {
          console.log('Admin found through collection API:', adminUser);
          
          // Update admin
          const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
          await usersCollection.updateOne(
            { email: 'laxmisah988@gmail.com' },
            { 
              $set: { 
                password: hashedPassword,
                role: 'admin',
                active: true 
              } 
            }
          );
          console.log('Admin updated through collection API');
        } else {
          console.log('Admin not found, creating through collection API...');
          const hashedPassword = await bcrypt.hash('Laxmi@1234#', 10);
          
          await usersCollection.insertOne({
            name: 'Admin User',
            email: 'laxmisah988@gmail.com',
            password: hashedPassword,
            role: 'admin',
            active: true,
            createdAt: new Date()
          });
          console.log('Admin created through collection API');
        }
      } catch (collectionError) {
        console.error('Collection manipulation failed:', collectionError);
        throw collectionError;
      }
    }
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    console.log('=====================================');
    console.log('ADMIN USER READY FOR LOGIN:');
    console.log('Email: laxmisah988@gmail.com');
    console.log('Password: Laxmi@1234#');
    console.log('=====================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in admin script:', error);
    
    if (mongoose.connection) {
      await mongoose.connection.close().catch(console.error);
      console.log('MongoDB connection closed after error');
    }
    
    process.exit(1);
  }
}

createAdminDirectly(); 