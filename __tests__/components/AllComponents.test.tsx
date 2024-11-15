import { testComponentRendering } from '../utils/testUtils';
import LoginForm from '@/components/LoginForm';
// Import all your components here

// Mock common hooks and services
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    // Add other router methods you use
  })
}));

// Add other global mocks here

// Test each component with various prop combinations
testComponentRendering(LoginForm, [
  {},
  { onSuccess: () => {} },
  { onError: () => {} },
  { isLoading: true },
]);

// Add more components with their prop combinations 