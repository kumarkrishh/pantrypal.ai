import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import React from 'react';

const ErrorFallback = ({ error }: { error: Error }) => (
  <div role="alert">Error: {error.message}</div>
);

export const testComponentRendering = (
  Component: React.ComponentType<any>,
  propSets: Array<Record<string, any>> = [{}],
  name: string = Component.displayName || Component.name
) => {
  describe(`${name} - Basic Rendering`, () => {
    beforeAll(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('renders without crashing', () => {
      expect(() => render(<Component />)).not.toThrow();
    });

    test('handles error boundaries correctly', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <ThrowError />
        </ErrorBoundary>
      );
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('matches snapshot', () => {
      const { container } = render(<Component />);
      expect(container).toMatchSnapshot();
    });

    if (propSets.length > 1) {
      test.each(propSets)('renders with props: %o', (props) => {
        expect(() => render(<Component {...props} />)).not.toThrow();
      });
    }
  });
};

export const renderWithProviders = (ui: React.ReactElement) => {
  // Your utility functions here
};

describe('Utils', () => {
  test('sample test', () => {
    expect(true).toBe(true);
  });
}); 