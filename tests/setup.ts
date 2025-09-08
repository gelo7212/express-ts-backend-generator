// Test setup file - runs before each test file
import 'jest';

// Setup test environment
beforeAll(() => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
});

afterAll(() => {
  // Cleanup after all tests
});
