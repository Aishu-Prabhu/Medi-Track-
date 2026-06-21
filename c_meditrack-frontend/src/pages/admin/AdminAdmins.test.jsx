// =======================================
// AdminAdmins.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import AdminAdmins from './AdminAdmins';

import {
  getAllAdmins,
  deleteAdmin,
  resetAdminPassword
} from '../../api/authService';


// ===============================
// Mock Router
// ===============================
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));


// ===============================
// Mock Auth Context
// ===============================
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      email: 'mainadmin@gmail.com'
    },
    role: 'SUPER_ADMIN'
  })
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
jest.mock('../../api/authService', () => ({
  getAllAdmins: jest.fn(),
  deleteAdmin: jest.fn(),
  resetAdminPassword: jest.fn()
}));


// ===============================
// Browser Mocks
// ===============================
beforeAll(() => {
  window.confirm = jest.fn(() => true);
  window.prompt = jest.fn(() => 'newpass123');
});


// ===============================
// Render
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <AdminAdmins />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('AdminAdmins', () => {

  beforeEach(() => {

    jest.clearAllMocks();

    window.confirm = jest.fn(() => true);
    window.prompt = jest.fn(() => 'newpass123');

    getAllAdmins.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Main Admin',
          email: 'mainadmin@gmail.com',
          role: 'SUPER_ADMIN'
        },
        {
          id: 2,
          name: 'Sub Admin',
          email: 'subadmin@gmail.com',
          role: 'ADMIN'
        }
      ]
    });

    deleteAdmin.mockResolvedValue({});
    resetAdminPassword.mockResolvedValue({});
  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/manage admins/i)
    ).toBeInTheDocument();
  });


  test('admin names shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/main admin/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/sub admin/i)
    ).toBeInTheDocument();
  });


  test('total admins shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/total admins/i)
    ).toBeInTheDocument();

    const twos =
      await screen.findAllByText('2');

    expect(
      twos.length
    ).toBeGreaterThan(0);
  });


  test('current user shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/current user/i)
    ).toBeInTheDocument();
  });


  test('protected shown for super admin', async () => {
    renderPage();

    expect(
      await screen.findByText(/protected/i)
    ).toBeInTheDocument();
  });


  test('reset password works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /reset/i
      })
    );

    await waitFor(() => {
      expect(
        resetAdminPassword
      ).toHaveBeenCalledWith(
        2,
        'newpass123'
      );
    });
  });


  test('delete admin works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /delete/i
      })
    );

    await waitFor(() => {
      expect(
        deleteAdmin
      ).toHaveBeenCalledWith(2);
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


  test('api called', async () => {
    renderPage();

    await waitFor(() => {
      expect(
        getAllAdmins
      ).toHaveBeenCalled();
    });
  });

});