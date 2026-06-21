// =======================================
// AdminDashboard.test.jsx
// =======================================

import {
  render,
  screen,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

import {
  getAllPatients
} from '../../api/patientService';

import {
  getAllDoctors
} from '../../api/doctorService';

import {
  getAllAppointments
} from '../../api/appointmentService';

import {
  getAllPrescriptions
} from '../../api/prescriptionService';

import {
  getAllAdmins
} from '../../api/authService';


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
jest.mock('../../api/patientService', () => ({
  getAllPatients: jest.fn()
}));

jest.mock('../../api/doctorService', () => ({
  getAllDoctors: jest.fn()
}));

jest.mock('../../api/appointmentService', () => ({
  getAllAppointments: jest.fn()
}));

jest.mock('../../api/prescriptionService', () => ({
  getAllPrescriptions: jest.fn()
}));

jest.mock('../../api/authService', () => ({
  getAllAdmins: jest.fn()
}));


// ===============================
// Render
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <AdminDashboard />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminDashboard', () => {

  beforeEach(() => {

    getAllPatients.mockResolvedValue({
      data: [{ id: 1 }, { id: 2 }]
    });

    getAllDoctors.mockResolvedValue({
      data: [{ id: 1 }]
    });

    getAllAppointments.mockResolvedValue({
      data: [
        {
          id: 11,
          patientName: 'Aishwarya',
          doctorName: 'Dr Ravi',
          appointmentDate: '2026-05-10',
          status: 'CONFIRMED'
        },
        {
          id: 12,
          patientName: 'Rahul',
          doctorName: 'Dr Meena',
          appointmentDate: '2026-05-11',
          status: 'PENDING_PAYMENT'
        }
      ]
    });

    getAllPrescriptions.mockResolvedValue({
      data: [
        { id: 1 },
        { id: 2 },
        { id: 3 }
      ]
    });

    getAllAdmins.mockResolvedValue({
      data: [
        { id: 1 },
        { id: 2 }
      ]
    });

  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/admin dashboard/i)
    ).toBeInTheDocument();
  });


  test('dashboard sections shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/quick actions/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/recent appointments/i)
    ).toBeInTheDocument();
  });


  test('quick links shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/add doctor/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/add admin/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/manage admins/i)
    ).toBeInTheDocument();
  });


  test('appointment names shown', async () => {
    renderPage();

    const items =
      await screen.findAllByText(/aishwarya|rahul/i);

    expect(
      items.length
    ).toBeGreaterThan(0);
  });


  test('stats cards visible', async () => {
    renderPage();

    expect(
      await screen.findByText(/prescriptions/i)
    ).toBeInTheDocument();

    const numbers =
      await screen.findAllByText(
        /1|2|3/
      );

    expect(
      numbers.length
    ).toBeGreaterThan(0);
  });


  test('all apis called', async () => {
    renderPage();

    await waitFor(() => {
      expect(getAllPatients).toHaveBeenCalled();
      expect(getAllDoctors).toHaveBeenCalled();
      expect(getAllAppointments).toHaveBeenCalled();
      expect(getAllPrescriptions).toHaveBeenCalled();
      expect(getAllAdmins).toHaveBeenCalled();
    });
  });

});