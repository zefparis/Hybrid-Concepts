import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { 
  errorHandler, 
  ValidationError, 
  AuthenticationError, 
  NotFoundError,
  asyncHandler,
  validateRequest
} from '../../middleware/errorHandler';
import { ZodError, z } from 'zod';

// Mock Express objects
const mockRequest = (overrides = {}) => ({
  method: 'GET',
  url: '/test',
  ip: '127.0.0.1',
  get: jest.fn().mockReturnValue('test-agent'),
  headers: {},
  ...overrides,
}) as unknown as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('Error Handler Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('errorHandler', () => {
    it('should handle ValidationError correctly', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new ValidationError('Invalid input');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid input',
          code: 'ValidationError'
        }
      });
    });

    it('should handle AuthenticationError correctly', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new AuthenticationError();

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AuthenticationError'
        }
      });
    });

    it('should handle ZodError with detailed validation errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      });

      try {
        schema.parse({ email: 'invalid', age: 15 });
      } catch (zodError) {
        errorHandler(zodError as ZodError, req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'ZodError',
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'email',
                message: expect.stringContaining('email')
              }),
              expect.objectContaining({
                field: 'age',
                message: expect.stringContaining('18')
              })
            ])
          }
        });
      }
    });

    it('should handle database constraint errors', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('duplicate key value violates unique constraint');

      errorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Resource already exists',
          code: 'UNKNOWN_ERROR'
        }
      });
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            stack: expect.any(String)
          })
        })
      );
    });

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Test error');

      errorHandler(error, req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.not.objectContaining({
            stack: expect.any(String)
          })
        })
      );
    });
  });

  describe('asyncHandler', () => {
    it('should catch async errors and pass to next', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const asyncFunction = async () => {
        throw new Error('Async error');
      };

      const wrappedFunction = asyncHandler(asyncFunction);
      await wrappedFunction(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle successful async operations', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      const asyncFunction = async () => {
        return 'success';
      };

      const wrappedFunction = asyncHandler(asyncFunction);
      await wrappedFunction(req, res, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Custom Error Classes', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Test validation error');
      
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Test validation error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should create AuthenticationError with default message', () => {
      const error = new AuthenticationError();
      
      expect(error.name).toBe('AuthenticationError');
      expect(error.message).toBe('Authentication required');
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it('should create NotFoundError with custom message', () => {
      const error = new NotFoundError('User not found');
      
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });
  });
});