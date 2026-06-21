// =======================================
// DoctorSlots.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import DoctorSlots from './DoctorSlots';

import {
  getAllDoctors
} from '../../api/doctorService';

import {
  generateSlots,
  getAllSlots
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
  generateSlots: jest.fn(),
  getAllSlots: jest.fn()
}));


// ===============================
// Render Helper
// ===============================
const renderPage = () => {
  render(<DoctorSlots />);
};


// ===============================
// Tests
// ===============================
describe('DoctorSlots', () => {

  beforeEach(() => {

    getAllDoctors.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Ravi Kumar',
          email: 'ravi@gmail.com'
        }
      ]
    });

    generateSlots.mockResolvedValue({
      data: {
        message: 'Generated'
      }
    });

    getAllSlots.mockResolvedValue({
      data: [
        {
          id: 1,
          slotTime: '10:00 AM',
          status: 'AVAILABLE'
        },
        {
          id: 2,
          slotTime: '11:00 AM',
          status: 'BOOKED'
        }
      ]
    });

  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/manage slots/i)
    ).toBeInTheDocument();
  });


  test('date input shown', async () => {
    renderPage();

    await screen.findByText(/manage slots/i);

    expect(
      document.querySelector('input[type="date"]')
    ).toBeInTheDocument();
  });


  test('generate slots button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /generate slots/i
      })
    ).toBeInTheDocument();
  });


  test('view slots button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /view slots/i
      })
    ).toBeInTheDocument();
  });


  test('generate slots works', async () => {
    renderPage();

    await screen.findByText(/manage slots/i);

    const dateInput =
      document.querySelector('input[type="date"]');

    fireEvent.change(dateInput, {
      target: {
        value: '2026-05-10'
      }
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /generate slots/i
      })
    );

    await waitFor(() => {
      expect(
        generateSlots
      ).toHaveBeenCalledWith(
        1,
        '2026-05-10'
      );
    });
  });


  test('view slots works', async () => {
    renderPage();

    await screen.findByText(/manage slots/i);

    const dateInput =
      document.querySelector('input[type="date"]');

    fireEvent.change(dateInput, {
      target: {
        value: '2026-05-10'
      }
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /view slots/i
      })
    );

    await waitFor(() => {
      expect(
        getAllSlots
      ).toHaveBeenCalledWith(
        1,
        '2026-05-10'
      );
    });
  });


  test('slots displayed', async () => {
    renderPage();

    await screen.findByText(/manage slots/i);

    const dateInput =
      document.querySelector('input[type="date"]');

    fireEvent.change(dateInput, {
      target: {
        value: '2026-05-10'
      }
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /view slots/i
      })
    );

    expect(
      await screen.findByText(/10:00 am/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/available/i)
    ).toBeInTheDocument();
  });

});