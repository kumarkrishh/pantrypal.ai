import { render, screen } from '@testing-library/react';
import LoginForm from '@/components/LoginForm';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    // Add other router methods you use
  })
}));

describe('LoginForm', () => {
  test('renders login form with email and password inputs', () => {
    render(<LoginForm />);
    
    // Check if essential elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
