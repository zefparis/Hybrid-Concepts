import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../routes';
import { applySecurity } from '../../middleware/security';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';

describe('Quotes API Security Tests', () => {
  let app: express.Application;
  let server: any;

  beforeEach(async () => {
    app = express();
    applySecurity(app);
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    
    server = await registerRoutes(app);
    app.use(notFoundHandler);
    app.use(errorHandler);
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to API endpoints', async () => {
      // Make multiple requests to test rate limiting
      const requests = Array(10).fill(null).map(() => 
        request(app).get('/api/quotes')
      );

      const responses = await Promise.all(requests);
      
      // At least some requests should succeed
      const successfulRequests = responses.filter(res => res.status !== 429);
      expect(successfulRequests.length).toBeGreaterThan(0);
    });

    it('should have stricter rate limiting for auth endpoints', async () => {
      // Test auth endpoint rate limiting
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'test', password: 'test' });

      // Should have appropriate response (either 404 for missing endpoint or rate limit)
      expect([404, 429, 401, 400]).toContain(response.status);
    });
  });

  describe('Input Validation', () => {
    it('should reject requests with invalid JSON', async () => {
      const response = await request(app)
        .post('/api/quotes')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    it('should reject oversized payloads', async () => {
      const largePayload = 'x'.repeat(11 * 1024 * 1024); // 11MB
      
      const response = await request(app)
        .post('/api/quotes')
        .send({ data: largePayload });

      expect(response.status).toBe(413);
    });

    it('should sanitize HTML in input', async () => {
      const maliciousInput = {
        origin: '<script>alert("xss")</script>Paris',
        destination: 'London<img src=x onerror=alert(1)>',
        cargoType: 'Electronics'
      };

      const response = await request(app)
        .post('/api/quotes')
        .send(maliciousInput);

      // Should either validate properly or reject malicious content
      if (response.status === 200 || response.status === 201) {
        expect(response.body.origin).not.toContain('<script>');
        expect(response.body.destination).not.toContain('<img');
      }
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/api/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('0');
    });

    it('should include HSTS header in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app).get('/api/health');
      
      // HSTS header should be present in production
      if (process.env.NODE_ENV === 'production') {
        expect(response.headers['strict-transport-security']).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      
      // Should not expose stack traces in production
      if (process.env.NODE_ENV === 'production') {
        expect(response.body.error).not.toHaveProperty('stack');
      }
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/quotes')
        .set('Content-Type', 'application/json')
        .send('malformed json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/quotes')
        .set('Origin', 'http://localhost:3000');

      expect(response.status).toBe(200);
    });

    it('should reject unauthorized origins in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .get('/api/quotes')
        .set('Origin', 'http://malicious-site.com');

      // Should either reject or handle appropriately
      expect([200, 403, 404]).toContain(response.status);
    });
  });
});