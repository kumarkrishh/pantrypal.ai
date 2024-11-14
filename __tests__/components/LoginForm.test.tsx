import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '@/components/LoginForm';
import { signIn } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    render(<LoginForm />);
    
    // Check for main elements
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred sign in method')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles Google sign in', async () => {
    render(<LoginForm />);
    
    const googleButton = screen.getByText('Continue with Google');
    await userEvent.click(googleButton);

    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
  });

  it('handles email/password submission', async () => {
    render(<LoginForm />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('disables form elements while loading', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    const googleButton = screen.getByText('Continue with Google');

    // Click submit to trigger loading state
    await userEvent.click(submitButton);
  });
}); 