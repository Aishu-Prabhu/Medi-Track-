// =======================================
// AdminAppointments.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminAppointments from './AdminAppointments';

import {
  getAllAppointments,
  cancelAppointment
} from '../../api/appointmentService';


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
jest.mock('../../components/common/Spinner', () => () =>
  <div>Loading...</div>
);

jest.mock('../../components/common/Alert', () => ({ message }) =>
  message ? <div>{message}</div> : null
);


// ===============================
// Mock APIs
// ===============================
jest.mock('../../api/appointmentService', () => ({
  getAllAppointments: jest.fn(),
  cancelAppointment: jest.fn()
}));


// ===============================
// Browser Confirm
// ===============================
beforeAll(() => {
  window.confirm = jest.fn(() => true);
});


// ===============================
// Render
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <AdminAppointments />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminAppointments', () => {

  beforeEach(() => {

    jest.clearAllMocks();

    window.confirm = jest.fn(() => true);

    getAllAppointments.mockResolvedValue({
      data: [
        {
          id: 1,
          patientName: 'Aishwarya',
          doctorName: 'Dr Ravi',
          specialization: 'Cardiology',
          appointmentDate: '2026-05-10',
          slot: '10:00 AM',
          status: 'CONFIRMED'
        },
        {
          id: 2,
          patientName: 'Rahul',
          doctorName: 'Dr Meena',
          specialization: 'Dermatology',
          appointmentDate: '2026-05-11',
          slot: '11:00 AM',
          status: 'PENDING_PAYMENT'
        },
        {
          id: 3,
          patientName: 'Priya',
          doctorName: 'Dr Arun',
          specialization: 'Neurology',
          appointmentDate: '2026-05-12',
          slot: '12:00 PM',
          status: 'COMPLETED'
        }
      ]
    });

    cancelAppointment.mockResolvedValue({
      data: {
        id: 1,
        patientName: 'Aishwarya',
        doctorName: 'Dr Ravi',
        specialization: 'Cardiology',
        appointmentDate: '2026-05-10',
        slot: '10:00 AM',
        status: 'CANCELLED'
      }
    });

  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/appointment management/i)
    ).toBeInTheDocument();
  });


  test('appointments shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/aishwarya/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/rahul/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/priya/i)
    ).toBeInTheDocument();
  });


  test('filter works', async () => {
    renderPage();

    // Wait for all data to load first
    await screen.findByText(/aishwarya/i);
    await screen.findByText(/rahul/i);
    await screen.findByText(/priya/i);

    fireEvent.click(
      screen.getByRole('button', {
        name: /^completed$/i
      })
    );

    await waitFor(() => {
      expect(
        screen.queryByText(/rahul/i)
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/priya/i)
    ).toBeInTheDocument();
  });


  test('cancel appointment works', async () => {
    renderPage();

    // Wait for all data to load first
    await screen.findByText(/aishwarya/i);
    await screen.findByText(/rahul/i);
    await screen.findByText(/priya/i);

    // Click CONFIRMED filter so cancel button appears
    fireEvent.click(
      screen.getByRole('button', {
        name: /^confirmed$/i
      })
    );

    // Wait for cancel button to appear
    const buttons =
      await screen.findAllByRole('button', {
        name: /^cancel$/i
      });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(
        cancelAppointment
      ).toHaveBeenCalledWith(1);
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


  test('total records shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/total records/i)
    ).toBeInTheDocument();
  });


  test('api called', async () => {
    renderPage();

    await waitFor(() => {
      expect(
        getAllAppointments
      ).toHaveBeenCalled();
    });
  });

});