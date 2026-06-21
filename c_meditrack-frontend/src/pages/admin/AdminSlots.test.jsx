// =======================================
// AdminSlots.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminSlots from './AdminSlots';

import {
  getAllDoctors
} from '../../api/doctorService';

import {
  generateSlots,
  getAllSlots
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
  render(
    <BrowserRouter>
      <AdminSlots />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminSlots', () => {

  beforeEach(() => {

    jest.clearAllMocks();

    getAllDoctors.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Ravi Kumar',
          specialization: 'Cardiology'
        },
        {
          id: 2,
          name: 'Meena',
          specialization: 'Dermatology'
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
      await screen.findByText(/slot management/i)
    ).toBeInTheDocument();
  });


  test('doctor dropdown shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('combobox')
    ).toBeInTheDocument();
  });


  test('date input shown', async () => {
    renderPage();

    await screen.findByText(/slot management/i);

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

    fireEvent.change(
      await screen.findByRole('combobox'),
      {
        target: { value: '1' }
      }
    );

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
        '1',
        '2026-05-10'
      );
    });
  });


  test('view slots works', async () => {
    renderPage();

    fireEvent.change(
      await screen.findByRole('combobox'),
      {
        target: { value: '1' }
      }
    );

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
        '1',
        '2026-05-10'
      );
    });
  });


  test('slots displayed', async () => {
    renderPage();

    fireEvent.change(
      await screen.findByRole('combobox'),
      {
        target: { value: '1' }
      }
    );

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