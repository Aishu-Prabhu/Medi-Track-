import {
  render,
  screen
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import BookAppointment from './BookAppointment';

import {
  getAvailableDoctors,
  getDoctorsBySpecialization
} from '../../api/doctorService';

import { getMyProfile } from '../../api/patientService';


// ===============================
// Mock Components
// ===============================
jest.mock('../../components/common/Spinner', () => () =>
  <div>Loading...</div>
);

jest.mock('../../components/common/Alert', () => ({ message }) =>
  message ? <div>{message}</div> : null
);


// ===============================
// Mock APIs
// ===============================
jest.mock('../../api/doctorService', () => ({
  getAvailableDoctors: jest.fn(),
  getDoctorsBySpecialization: jest.fn()
}));

jest.mock('../../api/appointmentService', () => ({
  getAvailableSlots: jest.fn(),
  bookAppointment: jest.fn(),
  markPaymentSuccess: jest.fn()
}));

jest.mock('../../api/paymentService', () => ({
  createPayment: jest.fn(),
  verifyPayment: jest.fn()
}));

jest.mock('../../api/patientService', () => ({
  getMyProfile: jest.fn()
}));


// ===============================
// Render Helper
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <BookAppointment />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('BookAppointment', () => {

  beforeEach(() => {

    getMyProfile.mockResolvedValue({
      data: {
        id: 1,
        name: 'Aishwarya',
        email: 'aish@gmail.com',
        phone: '9876543210'
      }
    });

    getAvailableDoctors.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Ravi Kumar',
          specialization: 'Cardiology',
          consultationFee: 500
        }
      ]
    });

    getDoctorsBySpecialization.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Ravi Kumar',
          specialization: 'Cardiology',
          consultationFee: 500
        }
      ]
    });

  });


  test('page loads', async () => {
    renderPage();

    const items =
      await screen.findAllByText(/book appointment/i);

    expect(items.length).toBeGreaterThan(0);
  });


  // FIXED — page has 2 dropdowns so use findAllByRole
  test('doctor dropdown shown', async () => {
    renderPage();

    const dropdowns =
      await screen.findAllByRole('combobox');

    // dropdowns[0] = specialization
    // dropdowns[1] = doctor
    expect(dropdowns.length).toBeGreaterThanOrEqual(2);
    expect(dropdowns[1]).toBeInTheDocument();
  });


  test('specialization dropdown shown', async () => {
    renderPage();

    const dropdowns =
      await screen.findAllByRole('combobox');

    expect(dropdowns[0]).toBeInTheDocument();
  });


  test('both dropdowns present', async () => {
    renderPage();

    const dropdowns =
      await screen.findAllByRole('combobox');

    expect(dropdowns.length).toBe(2);
  });


  test('date input shown', async () => {
    renderPage();

    expect(
      document.querySelector('input[type="date"]')
    ).toBeInTheDocument();
  });


  test('check slots button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /check available slots/i
      })
    ).toBeInTheDocument();
  });


  test('book appointment button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /book appointment/i
      })
    ).toBeInTheDocument();
  });


  test('doctor name shown in dropdown', async () => {
    renderPage();

    expect(
      await screen.findByText(/ravi kumar/i)
    ).toBeInTheDocument();
  });


  test('specialization options shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/cardiologist/i)
    ).toBeInTheDocument();
  });


  test('check slots button disabled when no doctor selected', async () => {
    renderPage();

    const btn = await screen.findByRole('button', {
      name: /check available slots/i
    });

    expect(btn).toBeDisabled();
  });


  test('book appointment button disabled when no slot selected', async () => {
    renderPage();

    const btn = await screen.findByRole('button', {
      name: /book appointment/i
    });

    expect(btn).toBeDisabled();
  });

});