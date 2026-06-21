// Import testing tools
import {
  render,       // used to load component in test environment
  screen,       // used to find elements on screen
  fireEvent,    // used to simulate click / typing
  waitFor       // waits for async code
} from '@testing-library/react';

// Import Login page component
import LoginPage from './LoginPage';

// Needed because LoginPage uses Link / navigate
import { BrowserRouter } from 'react-router-dom';

// Import login API method
import { loginUser } from '../../api/authService';


// Mock login API (real backend won't call during test)
jest.mock('../../api/authService', () => ({
  loginUser: jest.fn()
}));


// Mock AuthContext login function
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn()
  })
}));


// Common render function
const renderPage = () => {
  render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};


// Group all LoginPage tests
describe('LoginPage', () => {


  // Test email input box exists
  test('email input exists', () => {
    renderPage();

    expect(
      screen.getByPlaceholderText(/user@gmail.com/i)
    ).toBeInTheDocument();
  });


  // Test password input box exists
  test('password input exists', () => {
    renderPage();

    expect(
      screen.getByPlaceholderText(/enter password/i)
    ).toBeInTheDocument();
  });


  // Test forgot password popup opens after click
  test('forgot password modal opens', () => {
    renderPage();

    fireEvent.click(
      screen.getByText(/forgot password/i)
    );

    expect(
      screen.getAllByText(/forgot password/i).length
    ).toBeGreaterThan(1);
  });


  // Test heading exists
  test('renders login page', () => {
    renderPage();

    expect(
      screen.getByText(/welcome back/i)
    ).toBeInTheDocument();
  });


  // Test login API called after entering data + clicking login
  test('login api called on submit', async () => {

    // Fake successful API response
    loginUser.mockResolvedValue({
      data: {
        token: 'abc123',
        email: 'test@gmail.com',
        role: 'PATIENT'
      }
    });

    renderPage();

    // Type email
    fireEvent.change(
      screen.getByPlaceholderText(/user@gmail.com/i),
      {
        target: { value: 'test@gmail.com' }
      }
    );

    // Type password
    fireEvent.change(
      screen.getByPlaceholderText(/enter password/i),
      {
        target: { value: '123456' }
      }
    );

    // Click login button
    fireEvent.click(
      screen.getByRole('button', { name: /login/i })
    );

    // Check API called with entered values
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith(
        'test@gmail.com',
        '123456'
      );
    });
  });


  // Test forgot password text/button visible
  test('forgot password button exists', () => {
    renderPage();

    expect(
      screen.getByText(/forgot password/i)
    ).toBeInTheDocument();
  });

});