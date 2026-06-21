// =======================================
// AdminCreateDoctor.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminCreateDoctor from './AdminCreateDoctor';

import {
  createDoctor
} from '../../api/authService';

import {
  addDoctor
} from '../../api/doctorService';


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
    options,
    type = 'text',
    placeholder
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>

      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="">Select</option>

          {options.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      )}
    </div>
  )
);


// ===============================
// Mock useForm
// IMPORTANT FIX:
// use one shared validate fn
// ===============================
const mockValidate = jest.fn(() => true);

jest.mock('../../hooks/useForm', () => ({
  useForm: () => ({
    values: {
      name: 'Ravi Kumar',
      email: 'ravi@gmail.com',
      password: '123456',
      phone: '9876543210',
      specialization: 'CARDIOLOGIST',
      experience: '10',
      qualification: 'MBBS'
    },
    errors: {},
    handleChange: jest.fn(),
    validate: mockValidate,
    reset: jest.fn()
  })
}));


// ===============================
// Mock APIs
// ===============================
jest.mock('../../api/authService', () => ({
  createDoctor: jest.fn()
}));

jest.mock('../../api/doctorService', () => ({
  addDoctor: jest.fn()
}));


// ===============================
// Render
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <AdminCreateDoctor />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminCreateDoctor', () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockValidate.mockReturnValue(true);

    createDoctor.mockResolvedValue({});
    addDoctor.mockResolvedValue({});
  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/add new doctor/i)
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

    expect(
      screen.getByLabelText(/phone/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/specialization/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/qualification/i)
    ).toBeInTheDocument();
  });


  test('create doctor button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /create doctor/i
      })
    ).toBeInTheDocument();
  });


  test('form submit works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /create doctor/i
      })
    );

    await waitFor(() => {

      expect(
        mockValidate
      ).toHaveBeenCalled();

      expect(
        createDoctor
      ).toHaveBeenCalled();

      expect(
        addDoctor
      ).toHaveBeenCalled();
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