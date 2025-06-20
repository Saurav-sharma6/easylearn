// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Rate limiter for forgot password endpoint
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per IP
  message: 'Too many requests, please try again after 15 minutes',
});

// Apply rate limiter to forgot password route
app.use('/api/users/forgot-password', forgotPasswordLimiter);

// Routes
app.use('/api/users', userRoutes);

// DB Connection
const PORT = process.env.PORT;

console.log(process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log(" Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });