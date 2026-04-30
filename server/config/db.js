const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/protask');
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (err) {
    console.log(`Error: ${err.message}`.red);
    console.log('Ensure MongoDB is running locally or provide a valid MONGO_URI in server/.env'.yellow);
    process.exit(1);
  }
};

module.exports = connectDB;
