// =======================================
// AdminPatients.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminPatients from './AdminPatients';

import {
  getAllPatients,
  deletePatient
} from '../../api/patientService';


// ===============================
// Mock Components
// ===============================
jest.mock('../../components/common/Spinner', () => () =>
  <div>Loading...</div>
);

jest.mock('../../components/common/Alert', () => ({ message }) =>
  message ? <div>{message}</div> : null
);

jest.mock('../../components/common/BackButton', () =>
  ({ to }) => <button>{to}</button>
);


// ===============================
// Mock APIs
// ===============================
jest.mock('../../api/patientService', () => ({
  getAllPatients: jest.fn(),
  deletePatient: jest.fn()
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
      <AdminPatients />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminPatients', () => {

  beforeEach(() => {

    jest.clearAllMocks();

    window.confirm = jest.fn(() => true);

    getAllPatients.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Aishwarya',
          email: 'aishu@gmail.com',
          phone: '9876543210',
          age: 22,
          bloodGroup: 'A+'
        },
        {
          id: 2,
          name: 'Rahul',
          email: 'rahul@gmail.com',
          phone: '9999999999',
          age: 25,
          bloodGroup: 'B+'
        }
      ]
    });

    deletePatient.mockResolvedValue({});
  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/patient management/i)
    ).toBeInTheDocument();
  });


  test('patient names shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/aishwarya/i)
    ).toBeInTheDocument();

    const rahul =
      await screen.findAllByText(/rahul/i);

    expect(
      rahul.length
    ).toBeGreaterThan(0);
  });


  test('search input shown', async () => {
    renderPage();

    expect(
      await screen.findByPlaceholderText(
        /search by id, name, email, phone, blood group/i
      )
    ).toBeInTheDocument();
  });


  test('search works', async () => {
    renderPage();

    fireEvent.change(
      await screen.findByPlaceholderText(
        /search by id, name, email, phone, blood group/i
      ),
      {
        target: { value: 'rahul' }
      }
    );

    const rahul =
      screen.getAllByText(/rahul/i);

    expect(
      rahul.length
    ).toBeGreaterThan(0);

    expect(
      screen.queryByText(/aishwarya/i)
    ).not.toBeInTheDocument();
  });


  test('delete patient works', async () => {
    renderPage();

    const buttons =
      await screen.findAllByRole('button', {
        name: /delete/i
      });

    fireEvent.click(buttons[0]);

    await waitFor(() => {
      expect(
        deletePatient
      ).toHaveBeenCalledWith(1);
    });
  });


  test('count shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/total patients/i)
    ).toBeInTheDocument();

    const twos =
      await screen.findAllByText('2');

    expect(
      twos.length
    ).toBeGreaterThan(0);
  });


  test('back button shown', async () => {
    renderPage();

    expect(
      await screen.findByText(
        /\/admin\/dashboard/i
      )
    ).toBeInTheDocument();
  });

});