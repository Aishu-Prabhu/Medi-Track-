// =======================================
// ProtectedRoute.test.jsx
// Tests for ProtectedRoute.jsx
// =======================================

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  Navigate: ({ to }) => <div>Redirected to {to}</div>
}));

describe('ProtectedRoute.jsx', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should redirect to /login if user is not authenticated', () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      role: null
    });

    render(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Dashboard</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText('Redirected to /login')
    ).toBeInTheDocument();
  });

  test('should render children if authenticated and role is allowed', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ADMIN'
    });

    render(
      <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
        <div>Dashboard Page</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText('Dashboard Page')
    ).toBeInTheDocument();
  });

  test('should redirect ADMIN to admin dashboard if role not allowed', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'ADMIN'
    });

    render(
      <ProtectedRoute allowedRoles={['DOCTOR']}>
        <div>Hidden</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText('Redirected to /admin/dashboard')
    ).toBeInTheDocument();
  });

  test('should redirect DOCTOR to doctor dashboard if role not allowed', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'DOCTOR'
    });

    render(
      <ProtectedRoute allowedRoles={['PATIENT']}>
        <div>Hidden</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText('Redirected to /doctor/dashboard')
    ).toBeInTheDocument();
  });

  test('should redirect PATIENT to patient dashboard if role not allowed', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'PATIENT'
    });

    render(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Hidden</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText('Redirected to /patient/dashboard')
    ).toBeInTheDocument();
  });

  test('should redirect unknown role to /login', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'UNKNOWN_ROLE'
    });

    render(
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div>Hidden</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText('Redirected to /login')
    ).toBeInTheDocument();
  });

  test('should render children when allowedRoles is not passed', () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      role: 'PATIENT'
    });

    render(
      <ProtectedRoute>
        <div>Open Protected Content</div>
      </ProtectedRoute>
    );

    expect(
      screen.getByText('Open Protected Content')
    ).toBeInTheDocument();
  });

});