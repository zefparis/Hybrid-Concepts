import { beforeAll, afterAll, afterEach } from '@jest/globals';

// Test environment setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/hybrid_concepts_test';
  process.env.SESSION_SECRET = 'test-session-secret-key';
  process.env.ANTHROPIC_API_KEY = 'test-key';
});

afterAll(async () => {
  // Cleanup after all tests
});

afterEach(async () => {
  // Clean up after each test
});