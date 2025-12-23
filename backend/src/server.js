const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Get allowed origins from env
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://freight-quotation-tool.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('Allowed CORS Origins:', allowedOrigins);

// Simple CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, true); // Allow all in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use((req, res, next) => {
  res.header('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.header('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Migration: Drop old googleId unique index (safe to run multiple times)
    try {
      const indexes = await mongoose.connection.db.collection('users').indexes();
      const hasOldIndex = indexes.some(idx => idx.name === 'googleId_1' && idx.unique === true);
      
      if (hasOldIndex) {
        await mongoose.connection.db.collection('users').dropIndex('googleId_1');
        console.log('✅ Dropped old googleId unique index');
      }
    } catch (error) {
      // Error code 27 = IndexNotFound (already dropped)
      if (error.code === 27) {
        console.log('ℹ️  Old index already dropped or never existed');
      } else {
        console.log('ℹ️  Index migration skipped:', error.message);
      }
    }
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
  });


// Import routes
const apiRoutes = require('./routes');

// Mount API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);
});
