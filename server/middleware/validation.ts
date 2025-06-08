import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const idParamSchema = z.object({
  id: z.coerce.number().positive()
});

export const stringIdParamSchema = z.object({
  id: z.string().min(1)
});

// Quote request validation
export const quoteRequestSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  cargoType: z.string().min(1, 'Cargo type is required'),
  weight: z.number().positive('Weight must be positive'),
  dimensions: z.string().optional(),
  value: z.number().positive().optional(),
  timeline: z.object({
    preferred: z.string(),
    latest: z.string()
  }),
  transportMode: z.enum(['auto', 'sea', 'air', 'road', 'rail', 'multimodal']).default('auto'),
  requirements: z.array(z.string()).default([]),
  notes: z.string().optional()
});

// Company settings validation
export const companySettingsSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  website: z.string().url().optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  settings: z.object({
    defaultCurrency: z.string().length(3),
    timezone: z.string(),
    language: z.enum(['en', 'fr']),
    notifications: z.object({
      email: z.boolean(),
      sms: z.boolean(),
      push: z.boolean()
    })
  })
});

// User profile validation
export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  preferences: z.object({
    language: z.enum(['en', 'fr']),
    timezone: z.string(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean()
    })
  }).optional()
});

// Shipment tracking validation
export const trackingSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  carrier: z.string().optional(),
  type: z.enum(['air', 'sea', 'road', 'rail']).optional()
});

// AI optimization request validation
export const aiOptimizationSchema = z.object({
  quoteRequestId: z.number().positive('Valid quote request ID is required'),
  preferences: z.object({
    prioritizeSpeed: z.boolean().default(false),
    prioritizeCost: z.boolean().default(true),
    prioritizeReliability: z.boolean().default(false),
    environmentalImpact: z.boolean().default(false)
  }).optional(),
  constraints: z.object({
    maxBudget: z.number().positive().optional(),
    latestDelivery: z.string().optional(),
    excludedCarriers: z.array(z.string()).default([]),
    requiredCertifications: z.array(z.string()).default([])
  }).optional()
});

// Contact form validation
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  company: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  inquiryType: z.enum(['general', 'sales', 'support', 'partnership']).default('general')
});

// Generic validation middleware factory
export const validate = (schema: z.ZodSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req[property]);
      
      if (!result.success) {
        const errorMessage = result.error.errors
          .map(err => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        
        throw new ValidationError(`Validation failed: ${errorMessage}`);
      }
      
      // Replace the original data with validated and transformed data
      req[property] = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1),
  mimetype: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(type),
    'Invalid file type'
  ),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB')
});

// API key validation for external integrations
export const apiKeySchema = z.object({
  service: z.enum(['google_maps', 'anthropic', 'stripe']),
  key: z.string().min(1, 'API key is required'),
  isActive: z.boolean().default(true)
});

// Webhook validation
export const webhookSchema = z.object({
  url: z.string().url('Valid webhook URL is required'),
  events: z.array(z.string()).min(1, 'At least one event type is required'),
  secret: z.string().min(8, 'Webhook secret must be at least 8 characters'),
  isActive: z.boolean().default(true)
});