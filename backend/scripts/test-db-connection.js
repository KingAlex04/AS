const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://hrmtracker:hrmtracker123@hrmtracker.mongodb.net/hrm-tracker?retryWrites=true&w=majority';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000
    });
    
    console.log('Connected to MongoDB!');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in the database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if users collection exists and count documents
    if (collections.some(c => c.name === 'users')) {
      const userCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log(`Number of users in the database: ${userCount}`);
    } else {
      console.log('No users collection found');
    }
    
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testConnection(); 