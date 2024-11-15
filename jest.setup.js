import '@testing-library/jest-dom'; 

const originalError = console.error;

console.error = (...args) => {
  const message = args[0];
  
  // Fail tests if there's an act() warning
  if (message && typeof message === 'string' && message.includes('not wrapped in act')) {
    throw new Error('Test failed due to act() warning: ' + message);
  }
  
  originalError.apply(console, args);
}; 