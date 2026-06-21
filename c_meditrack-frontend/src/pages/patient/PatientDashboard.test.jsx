// ===============================
// PatientDashboard.test.jsx
// Location:
// src/pages/patient/PatientDashboard.test.jsx
// ===============================

import {
  render,
  screen,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';

import PatientDashboard from './PatientDashboard';

import {
  getMyProfile
} from '../../api/patientService';

import {
  getAppointmentsByPatient
} from '../../api/appointmentService';


// ===============================
// Mock APIs
// ===============================
jest.mock('../../api/patientService', () => ({
  getMyProfile: jest.fn()
}));

jest.mock('../../api/appointmentService', () => ({
  getAppointmentsByPatient: jest.fn()
}));


// ===============================
// Mock Auth Context
// ===============================
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      email: 'aishu@gmail.com'
    }
  })
}));


// ===============================
// Common Render Function
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <PatientDashboard />
    </BrowserRouter>
  );
};


// ===============================
// Test Cases
// ===============================
describe('PatientDashboard', () => {

  // Run before every test
  beforeEach(() => {

    // Mock Profile API Response
    getMyProfile.mockResolvedValue({
      data: {
        id: 1,
        name: 'Aishwarya',
        email: 'aishu@gmail.com',
        bloodGroup: 'A+',
        age: 22
      }
    });

    // Mock Appointment API Response
    getAppointmentsByPatient.mockResolvedValue({
      data: [
        {
          id: 1,
          doctorName: 'Dr Ravi Kumar',
          specialization: 'Cardiology',
          appointmentDate: '2026-05-02',
          slot: '02:00 PM',
          status: 'CONFIRMED'
        },
        {
          id: 2,
          doctorName: 'Dr Meena',
          specialization: 'Dermatology',
          appointmentDate: '2026-05-03',
          slot: '10:00 AM',
          status: 'PENDING_PAYMENT'
        }
      ]
    });
  });


  // ===============================
  // UI Loads
  // ===============================
  test('dashboard loads successfully', async () => {
    renderPage();

    expect(
      await screen.findByText(/welcome back/i)
    ).toBeInTheDocument();
  });


  // ===============================
  // Patient Name Visible
  // ===============================
  test('patient name shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/aishwarya/i)
    ).toBeInTheDocument();
  });


  // ===============================
  // Doctor Name Visible
  // ===============================
  test('doctor name displayed', async () => {
    renderPage();

    expect(
      await screen.findByText(/dr ravi kumar/i)
    ).toBeInTheDocument();
  });


  // ===============================
  // Pending Payment Exists
  // (multiple places in UI)
  // ===============================
  test('pending payment shown', async () => {
    renderPage();

    const items =
      await screen.findAllByText(/pending payment/i);

    expect(items.length).toBeGreaterThan(0);
  });


  // ===============================
  // Book Appointment Button Exists
  // ===============================
  test('book appointment button exists', async () => {
    renderPage();

    expect(
      await screen.findByText(/book appointment/i)
    ).toBeInTheDocument();
  });


  // ===============================
  // APIs Called Properly
  // ===============================
  test('apis called properly', async () => {
    renderPage();

    await waitFor(() => {
      expect(getMyProfile).toHaveBeenCalled();

      expect(
        getAppointmentsByPatient
      ).toHaveBeenCalledWith(1);
    });
  });

});