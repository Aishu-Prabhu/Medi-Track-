// =======================================
// DoctorDashboard.test.jsx
// =======================================

import {
  render,
  screen,
  waitFor
} from '@testing-library/react';

import DoctorDashboard from './DoctorDashboard';

import {
  getAllDoctors
} from '../../api/doctorService';

import {
  getAppointmentsByDoctor
} from '../../api/appointmentService';


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
// Mock Auth Context
// ===============================
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Ravi Kumar',
      email: 'ravi@gmail.com'
    }
  })
}));


// ===============================
// Mock APIs
// ===============================
jest.mock('../../api/doctorService', () => ({
  getAllDoctors: jest.fn()
}));

jest.mock('../../api/appointmentService', () => ({
  getAppointmentsByDoctor: jest.fn()
}));


// ===============================
// Render Helper
// ===============================
const renderPage = () => {
  render(<DoctorDashboard />);
};


// ===============================
// Tests
// ===============================
describe('DoctorDashboard', () => {

  beforeEach(() => {

    getAllDoctors.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Ravi Kumar',
          email: 'ravi@gmail.com',
          specialization: 'Cardiology'
        }
      ]
    });

    getAppointmentsByDoctor.mockResolvedValue({
      data: [
        {
          id: 1,
          patientName: 'Aishwarya',
          appointmentDate:
            new Date()
              .toISOString()
              .split('T')[0],
          slot: '10:00 AM',
          status: 'CONFIRMED'
        },
        {
          id: 2,
          patientName: 'Rahul',
          appointmentDate:
            new Date()
              .toISOString()
              .split('T')[0],
          slot: '11:00 AM',
          status: 'PENDING_PAYMENT'
        }
      ]
    });

  });


  // Page Loads
  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/doctor dashboard/i)
    ).toBeInTheDocument();
  });


  // Welcome Text
  test('doctor welcome shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/welcome back/i)
    ).toBeInTheDocument();
  });


  // Total Appointments Visible
  test('stats shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/total appointments/i)
    ).toBeInTheDocument();
  });


  // Today's Schedule Visible
  test('today schedule shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/today's schedule/i)
    ).toBeInTheDocument();
  });


  // Patient Name Visible
  test('patient name shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/aishwarya/i)
    ).toBeInTheDocument();
  });


  // APIs Called Properly
  test('api called properly', async () => {
    renderPage();

    await waitFor(() => {
      expect(
        getAllDoctors
      ).toHaveBeenCalled();

      expect(
        getAppointmentsByDoctor
      ).toHaveBeenCalledWith(1);
    });
  });

});