import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import type { Express, Request, Response, NextFunction } from 'express';

// Rate limiting configuration
export const createRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60 * 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for trusted IPs in production
    skip: (req: Request) => {
      // Add your trusted IPs here if needed
      return false;
    }
  });
};

// Stricter rate limiting for authentication endpoints
export const createAuthRateLimit = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60 * 1000
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      if (origin.startsWith('http://localhost') || origin.startsWith('https://localhost')) {
        return callback(null, true);
      }
    }
    
    // In production, check against allowed domains
    const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
    if (allowedDomains.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Helmet security headers configuration
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.anthropic.com", "https://maps.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Apply all security middleware
export const applySecurity = (app: Express) => {
  // Security headers
  app.use(helmet(helmetOptions));
  
  // CORS
  app.use(cors(corsOptions));
  
  // Rate limiting
  app.use('/api/', createRateLimit());
  app.use('/api/auth', createAuthRateLimit());
  app.use('/api/login', createAuthRateLimit());
  
  // Trust proxy for rate limiting and security headers
  app.set('trust proxy', 1);
};