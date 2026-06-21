// ============================
// RegisterPage.test.jsx
// Location:
// src/pages/auth/RegisterPage.test.jsx
// ============================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import RegisterPage from './RegisterPage';
import { BrowserRouter } from 'react-router-dom';

import { registerUser } from '../../api/authService';


// Mock API
jest.mock('../../api/authService', () => ({
  registerUser: jest.fn()
}));


// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn()
  })
}));


// Mock SweetAlert
jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve())
}));


// Common render function
const renderPage = () => {
  render(
    <BrowserRouter>
      <RegisterPage />
    </BrowserRouter>
  );
};


describe('RegisterPage', () => {

  // Test page heading
  test('renders register page', () => {
    renderPage();

    expect(
      screen.getByText(/create account/i)
    ).toBeInTheDocument();
  });


  // Full Name input exists
  test('name input exists', () => {
    renderPage();

    expect(
      screen.getByPlaceholderText(/enter full name/i)
    ).toBeInTheDocument();
  });


  // Email input exists
  test('email input exists', () => {
    renderPage();

    expect(
      screen.getByPlaceholderText(/user@gmail.com/i)
    ).toBeInTheDocument();
  });


  // Password input exists
  test('password input exists', () => {
    renderPage();

    expect(
      screen.getByPlaceholderText(/strong password/i)
    ).toBeInTheDocument();
  });


  // Register API should call after submit
  test('register api called on submit', async () => {

    registerUser.mockResolvedValue({
      data: {
        message: 'success'
      }
    });

    renderPage();

    // Fill all required fields
    fireEvent.change(
      screen.getByPlaceholderText(/enter full name/i),
      { target: { value: 'Aishu' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/user@gmail.com/i),
      { target: { value: 'aishu@gmail.com' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/strong password/i),
      { target: { value: 'Aishu@123' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/10-digit number/i),
      { target: { value: '9876543210' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/age/i),
      { target: { value: '22' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/city \/ area/i),
      { target: { value: 'Bangalore' } }
    );

    // Blood group select
    fireEvent.change(
  screen.getByRole('combobox'),
  { target: { value: 'A+' } }
);
    // Click register button
    fireEvent.click(
      screen.getByRole('button', {
        name: /register/i
      })
    );

    // Verify API called
    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
    });
  });


  // Login link exists
  test('login link exists', () => {
    renderPage();

    expect(
      screen.getByText(/login/i)
    ).toBeInTheDocument();
  });

});