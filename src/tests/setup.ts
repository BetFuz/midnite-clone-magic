import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Setup for tests
beforeAll(() => {
  // Mock console methods to reduce noise
  global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
  };
});

afterEach(() => {
  // Clean up after each test
});

afterAll(() => {
  // Final cleanup
});
