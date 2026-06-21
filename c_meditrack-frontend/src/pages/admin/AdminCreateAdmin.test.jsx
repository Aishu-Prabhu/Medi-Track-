// =======================================
// AdminCreateAdmin.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminCreateAdmin from './AdminCreateAdmin';

import {
  createAdmin
} from '../../api/authService';


// ===============================
// Mock Router
// ===============================
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));


// ===============================
// Mock Components
// ===============================
jest.mock('../../components/common/Alert', () => ({ message }) =>
  message ? <div>{message}</div> : null
);

jest.mock('../../components/common/FormInput', () =>
  ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
);


// ===============================
// Mock useForm Hook
// ===============================
jest.mock('../../hooks/useForm', () => ({
  useForm: () => ({
    values: {
      name: 'Main Admin',
      email: 'admin@meditrack.com',
      password: '123456'
    },
    errors: {},
    handleChange: jest.fn(),
    validate: jest.fn(() => true),
    reset: jest.fn()
  })
}));


// ===============================
// Mock API
// ===============================
jest.mock('../../api/authService', () => ({
  createAdmin: jest.fn()
}));


// ===============================
// Render Helper
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <AdminCreateAdmin />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminCreateAdmin', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    createAdmin.mockResolvedValue({});
  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/create admin account/i)
    ).toBeInTheDocument();
  });


  test('all fields shown', async () => {
    renderPage();

    expect(
      await screen.findByLabelText(/full name/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/email/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/password/i)
    ).toBeInTheDocument();
  });


  test('create admin button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /create admin/i
      })
    ).toBeInTheDocument();
  });


  test('form submit works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /create admin/i
      })
    );

    await waitFor(() => {
      expect(
        createAdmin
      ).toHaveBeenCalledWith({
        name: 'Main Admin',
        email: 'admin@meditrack.com',
        password: '123456'
      });
    });
  });


  test('back button works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /back to dashboard/i
      })
    );

    expect(
      mockNavigate
    ).toHaveBeenCalledWith(
      '/admin/dashboard'
    );
  });

});