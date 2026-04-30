const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const colors = require('colors');
const connectDB = require('./config/db');

// Load env vars
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Route files
const auth = require('./routes/auth');
const projects = require('./routes/projects');
const tasks = require('./routes/tasks');
const users = require('./routes/users');

// Mount routers
app.get('/api', (req, res) => res.json({ message: 'Welcome to ProTask API' }));
app.use('/api/auth', auth);
app.use('/api/projects', projects);
app.use('/api/tasks', tasks);
app.use('/api/users', users);

const PORT = process.env.PORT || 5000;

// Serve frontend static files
// We remove the strict NODE_ENV check because Railway might not set it by default.
// Instead, we serve the dist folder if it exists.
const fs = require('fs');
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('Backend API is running. Please run frontend separately in development.'));
}

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
