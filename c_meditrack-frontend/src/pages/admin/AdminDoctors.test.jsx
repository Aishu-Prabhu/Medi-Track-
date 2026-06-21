// =======================================
// AdminDoctors.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminDoctors from './AdminDoctors';

import {
  getAllDoctors,
  deleteDoctor,
  toggleDoctorAvailability
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
  getAllDoctors: jest.fn(),
  deleteDoctor: jest.fn(),
  toggleDoctorAvailability: jest.fn()
}));


// ===============================
// Browser confirm mock
// ===============================
beforeAll(() => {
  window.confirm = jest.fn(() => true);
});


// ===============================
// Render Helper
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <AdminDoctors />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminDoctors', () => {

  beforeEach(() => {

    jest.clearAllMocks();

    window.confirm = jest.fn(() => true);

    getAllDoctors.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Dr Ravi Kumar',
          email: 'ravi@gmail.com',
          specialization: 'Cardiology',
          experience: 10,
          available: true
        },
        {
          id: 2,
          name: 'Dr Meena',
          email: 'meena@gmail.com',
          specialization: 'Dermatology',
          experience: 7,
          available: false
        }
      ]
    });

    deleteDoctor.mockResolvedValue({});

    toggleDoctorAvailability.mockResolvedValue({
      data: {
        id: 1,
        name: 'Dr Ravi Kumar',
        email: 'ravi@gmail.com',
        specialization: 'Cardiology',
        experience: 10,
        available: false
      }
    });

  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/doctor management/i)
    ).toBeInTheDocument();
  });


  test('doctor names shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/dr ravi kumar/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/dr meena/i)
    ).toBeInTheDocument();
  });


  test('search input shown', async () => {
    renderPage();

    expect(
      await screen.findByPlaceholderText(
        /search by id, name, email, specialization/i
      )
    ).toBeInTheDocument();
  });


  test('search works', async () => {
    renderPage();

    const input = await screen.findByPlaceholderText(
      /search by id, name, email, specialization/i
    );

    fireEvent.change(input, {
      target: { value: 'meena' }
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/dr ravi kumar/i)
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/dr meena/i)
    ).toBeInTheDocument();
  });


  test('toggle availability works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /disable/i
      })
    );

    await waitFor(() => {
      expect(
        toggleDoctorAvailability
      ).toHaveBeenCalledWith(1);
    });
  });


  test('delete doctor works', async () => {
    renderPage();

    const buttons =
      await screen.findAllByRole('button', {
        name: /delete/i
      });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(
        deleteDoctor
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

});