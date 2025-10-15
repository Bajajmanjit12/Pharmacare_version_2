// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');

// utils & DB
const logger = require('./utils/logger');
const connectToDatabase = require('./config/db');

// middleware
const errorMiddleware = require('./middleware/error-middleware');

// routers
const uploadRoute = require('./routers/upload-router');
const contactRoutes = require('./routers/contact-router'); // contact router

// Server Setup
const app = express();
const server = http.createServer(app);

// attach logger to app so routes can use it
app.set('logger', logger);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.set('trust proxy', 1); // trust first proxy

// Cookie parser
app.use(cookieParser());

// CORS
const allowedOrigins = ['http://localhost:5173'];
const PORT = process.env.PORT || 5000;
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, origin);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve static files from /uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      res.set('Access-Control-Expose-Headers', 'Content-Length');

      if (filePath.endsWith('.mp4')) res.set('Content-Type', 'video/mp4');
      else if (
        filePath.endsWith('.jpeg') ||
        filePath.endsWith('.jpg') ||
        filePath.endsWith('.png') ||
        filePath.endsWith('.webp')
      )
        res.set('Content-Type', 'image/jpeg');
    },
  })
);

// Health route
app.get('/', (req, res) => res.send('Welcome to the API'));

// Routers
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoute);

// Error middleware
app.use(errorMiddleware);

// Start server after connecting to DB
connectToDatabase()
  .then(() => {
    console.log('Connected to MongoDB successfully');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    logger.error('Error connecting to MongoDB', { error: error.message });
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server shut down gracefully.');
    process.exit(0);
  });
});

