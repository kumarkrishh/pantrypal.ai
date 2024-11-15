// LoginForm.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from '@/components/LoginForm';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginForm', () => {
  const push = jest.fn();

  beforeEach(() => {
    // Mock the useRouter hook to return a push function
    (useRouter as jest.Mock).mockReturnValue({ push });
    // Mock the signIn function to resolve successfully
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login form correctly', () => {
    render(<LoginForm />);
    
    // Check for the presence of form elements
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign up/i })).toBeInTheDocument();
  });

  it('calls signIn with Google when the Google button is clicked', async () => {
    render(<LoginForm />);
    
    const googleButton = screen.getByRole('button', { name: /Continue with Google/i });
    fireEvent.click(googleButton);
    
    expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/dashboard' });
  });

  it('submits the form with email and password', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const signInButton = screen.getByRole('button', { name: /Sign in/i });

    // Simulate user input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('navigates to the register page when "Sign up" is clicked', () => {
    render(<LoginForm />);
    
    const signUpButton = screen.getByRole('button', { name: /Sign up/i });
    fireEvent.click(signUpButton);
    
    expect(push).toHaveBeenCalledWith('/register');
  });
});
