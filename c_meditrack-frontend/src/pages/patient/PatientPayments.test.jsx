// =======================================
// PatientPayments.test.jsx
// =======================================

import {
  render,
  screen,
  waitFor,
  fireEvent
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import PatientPayments from './PatientPayments';

import {
  getMyProfile
} from '../../api/patientService';

import {
  getAppointmentsByPatient
} from '../../api/appointmentService';

import {
  createPayment
} from '../../api/paymentService';


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
jest.mock('../../api/patientService', () => ({
  getMyProfile: jest.fn()
}));

jest.mock('../../api/appointmentService', () => ({
  getAppointmentsByPatient: jest.fn()
}));

jest.mock('../../api/paymentService', () => ({
  createPayment: jest.fn(),
  verifyPayment: jest.fn()
}));


// ===============================
// Mock jsPDF
// ===============================
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFillColor: jest.fn(),
    rect: jest.fn(),
    setTextColor: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    save: jest.fn()
  }));
});


// ===============================
// Razorpay Mock
// ===============================
beforeAll(() => {
  window.Razorpay = jest.fn().mockImplementation((options) => ({
    open: () => {
      // simulate successful payment callback
      if (options && options.handler) {
        options.handler({
          razorpay_payment_id: 'pay_123',
          razorpay_order_id: 'order_123',
          razorpay_signature: 'sig_123'
        });
      }
    }
  }));
});


// ===============================
// Render
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <PatientPayments />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('PatientPayments', () => {

  beforeEach(() => {

    jest.clearAllMocks();

    getMyProfile.mockResolvedValue({
      data: {
        id: 1,
        name: 'Aishwarya',
        email: 'aishu@gmail.com'
      }
    });

    getAppointmentsByPatient.mockResolvedValue({
      data: [
        {
          id: 1,
          doctorName: 'Ravi Kumar',
          specialization: 'Cardiology',
          appointmentDate: '2026-05-02',
          slot: '02:00 PM',
          status: 'CONFIRMED'
        },
        {
          id: 2,
          doctorName: 'Meena',
          specialization: 'Dermatology',
          appointmentDate: '2026-05-03',
          slot: '10:00 AM',
          status: 'PENDING_PAYMENT'
        }
      ]
    });

    // IMPORTANT: real component usually expects id/order_id/amount
    createPayment.mockResolvedValue({
      data: {
        id: 'order_123',
        orderId: 'order_123',
        amount: 50000,
        currency: 'INR'
      }
    });

  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/payments & billing/i)
    ).toBeInTheDocument();
  });


  test('doctor names shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/ravi kumar/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/meena/i)
    ).toBeInTheDocument();
  });


  test('receipt button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /receipt/i
      })
    ).toBeInTheDocument();
  });


  test('pay now button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /pay now/i
      })
    ).toBeInTheDocument();
  });


  test('apis called properly', async () => {
    renderPage();

    await waitFor(() => {
      expect(getMyProfile).toHaveBeenCalled();

      expect(
        getAppointmentsByPatient
      ).toHaveBeenCalledWith(1);
    });
  });


  test('pay now starts payment', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /pay now/i
      })
    );

    await waitFor(() => {
      expect(
        createPayment
      ).toHaveBeenCalledTimes(1);
    });
  });

});