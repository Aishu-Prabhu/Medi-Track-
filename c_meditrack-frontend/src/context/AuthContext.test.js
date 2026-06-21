// src/context/AuthContext.test.js

import React from 'react';

import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';

import '@testing-library/jest-dom';

import {
  AuthProvider,
  useAuth,
} from './AuthContext';

import { jwtDecode } from 'jwt-decode';

// ======================================
// MOCK jwt-decode
// ======================================

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

// ======================================
// TEST COMPONENT
// ======================================

function TestComponent() {

  const {
    user,
    role,
    isAuthenticated,
    loading,
    login,
    logout,
  } = useAuth();

  return (
    <div>

      <div data-testid="loading">
        {loading ? 'true' : 'false'}
      </div>

      <div data-testid="authenticated">
        {isAuthenticated ? 'true' : 'false'}
      </div>

      <div data-testid="email">
        {user?.email || ''}
      </div>

      <div data-testid="role">
        {role || ''}
      </div>

      <div data-testid="name">
        {user?.name || ''}
      </div>

      <button
        onClick={() =>
          login('fake-token', 'Aishwarya')
        }
      >
        Login
      </button>

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}

// ======================================
// TESTS
// ======================================

describe('AuthContext', () => {

  beforeEach(() => {

    localStorage.clear();

    jest.clearAllMocks();
  });

  test('renders provider correctly', async () => {

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {

      expect(
        screen.getByTestId('loading')
      ).toHaveTextContent('false');
    });

    expect(
      screen.getByTestId('authenticated')
    ).toHaveTextContent('false');
  });

  test('login works correctly', async () => {

    jwtDecode.mockReturnValue({
      sub: 'aishu@gmail.com',
      role: 'PATIENT',
      exp: Date.now() / 1000 + 1000,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(
      screen.getByText('Login')
    );

    await waitFor(() => {

      expect(
        screen.getByTestId('authenticated')
      ).toHaveTextContent('true');
    });

    expect(
      screen.getByTestId('email')
    ).toHaveTextContent('aishu@gmail.com');

    expect(
      screen.getByTestId('role')
    ).toHaveTextContent('PATIENT');

    expect(
      screen.getByTestId('name')
    ).toHaveTextContent('Aishwarya');

    expect(
      localStorage.getItem('token')
    ).toBe('fake-token');
  });

  test('logout works correctly', async () => {

    jwtDecode.mockReturnValue({
      sub: 'aishu@gmail.com',
      role: 'DOCTOR',
      exp: Date.now() / 1000 + 1000,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(
      screen.getByText('Login')
    );

    await waitFor(() => {

      expect(
        screen.getByTestId('authenticated')
      ).toHaveTextContent('true');
    });

    fireEvent.click(
      screen.getByText('Logout')
    );

    await waitFor(() => {

      expect(
        screen.getByTestId('authenticated')
      ).toHaveTextContent('false');
    });

    expect(
      localStorage.getItem('token')
    ).toBeNull();
  });

  test('restores user from localStorage', async () => {

    localStorage.setItem(
      'token',
      'saved-token'
    );

    localStorage.setItem(
      'name',
      'Saved User'
    );

    jwtDecode.mockReturnValue({
      sub: 'saved@gmail.com',
      role: 'ADMIN',
      exp: Date.now() / 1000 + 1000,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {

      expect(
        screen.getByTestId('authenticated')
      ).toHaveTextContent('true');
    });

    expect(
      screen.getByTestId('email')
    ).toHaveTextContent('saved@gmail.com');

    expect(
      screen.getByTestId('role')
    ).toHaveTextContent('ADMIN');

    expect(
      screen.getByTestId('name')
    ).toHaveTextContent('Saved User');
  });

  test('logs out when token is expired', async () => {

    localStorage.setItem(
      'token',
      'expired-token'
    );

    jwtDecode.mockReturnValue({
      sub: 'expired@gmail.com',
      role: 'PATIENT',
      exp: Date.now() / 1000 - 1000,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {

      expect(
        screen.getByTestId('authenticated')
      ).toHaveTextContent('false');
    });

    expect(
      localStorage.getItem('token')
    ).toBeNull();
  });

  test('handles invalid token correctly', async () => {

    localStorage.setItem(
      'token',
      'invalid-token'
    );

    jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {

      expect(
        screen.getByTestId('authenticated')
      ).toHaveTextContent('false');
    });

    expect(
      localStorage.getItem('token')
    ).toBeNull();
  });

  test('useAuth throws error outside provider', () => {

    const consoleSpy =
      jest.spyOn(console, 'error')
          .mockImplementation(() => {});

    expect(() => render(<TestComponent />))
      .toThrow(
        'useAuth must be used inside AuthProvider'
      );

    consoleSpy.mockRestore();
  });

});