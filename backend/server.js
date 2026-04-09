import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

import userRoutes from './routes/userRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import diagnosticRoutes from './routes/diagnosticRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware
app.use(cookieParser());

// Enable CORS for the frontend and allow credentials for auth cookies
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Mount Routers
app.use('/api/users', userRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/v1', statsRoutes);

// Base route for testing
app.get('/', (req, res) => {
  res.send('PrepWise API is running...');
});

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server failed to start:', error);
      process.exit(1);
    }
  });
};

startServer(PORT);
