// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');
const userRoutes = require('./routes/authRoutes');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true, // Allow cookies/credentials to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all necessary methods
  allowedHeaders: ['Authorization', 'Content-Type'] // Allow relevant headers
};


// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

// Session Store
const store = new MongoDBStore({
  uri: process.env.MONGO_URI ,
  collection: 'sessions',
  ttl: 24 * 60 * 60, // 24 hours in seconds
  autoRemove: 'native' // Automatically remove expired sessions
}, (error) => {
  if (error) console.error('MongoDBStore connection error:', error);
});

app.use(session({
  secret: process.env.SESSION_SECRET || '12c7c9e8bfff508f8a92117350b045848c3885b588042d9df65a07d1b01e8218',
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: false // process.env.NODE_ENV === 'development'
  }
}));

// Ensure store is ready before starting the server
store.on('error', (error) => {
  console.error('Session store error:', error);
});

// Rate limiter for forgot password endpoint
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per IP
  message: 'Too many requests, please try again after 15 minutes',
});

// Apply rate limiter to forgot password route
app.use('/api/users/forgot-password', forgotPasswordLimiter);

// Routes
app.use('/api/users', authRoutes);
app.use('/api/courses', courseRoutes);

// DB Connection
const PORT = process.env.PORT || 5000;

console.log(process.env.MONGO_URI);

connectDB().then(() => {
    console.log(" Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });