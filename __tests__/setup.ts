import '@testing-library/jest-dom';

// Global test setup
beforeAll(() => {
  // Setup any global test environment needs
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Clean up after all tests
  jest.restoreAllMocks();
});

// Global mocks
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Add more global mocks as needed 

describe('Setup', () => {
  test('setup completes successfully', () => {
    expect(true).toBe(true);
  });
});