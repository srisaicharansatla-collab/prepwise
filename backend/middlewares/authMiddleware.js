import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token;

  // Read the JWT from the strictly secure HTTP-Only cookie 'jwt'
  token = req.cookies.jwt;

  // Fallback to reading the token from authorization headers (Bearer strategy)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Store resolved user directly on the request object for chained methods
      req.user = await User.findById(decoded.userId).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      res.status(401);
      // Delegate to centralized error handler securely without exposing token issues
      next(new Error('Not authorized, token validation failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no token provided'));
  }
};

// Role-based authorization middleware
export const restrictedTo = (...roles) => {
  return (req, res, next) => {
    // If the authenticated user strictly lacks an allowed role, reject immediately
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error('Access restricted: User role not authorized'));
    }
    next();
  };
};
