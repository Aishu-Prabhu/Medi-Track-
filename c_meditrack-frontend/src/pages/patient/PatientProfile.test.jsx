// =======================================
// PatientProfile.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import PatientProfile from './PatientProfile';

import {
  getMyProfile,
  updatePatient,
  updateMedicalHistory
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

jest.mock('../../components/common/FormInput', () =>
  ({ label, name, value, onChange, options }) => (
    <div>
      <label>{label}</label>

      {options ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="">Select</option>
          {options.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={name}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  )
);


// ===============================
// Mock Hook
// ===============================
jest.mock('../../hooks/useForm', () => ({
  useForm: () => ({
    values: {
      name: 'Aishwarya',
      phone: '9876543210',
      age: '22',
      bloodGroup: 'A+',
      address: 'Bangalore'
    },
    errors: {},
    handleChange: jest.fn(),
    validate: () => true,
    setValues: jest.fn()
  })
}));


// ===============================
// Mock APIs
// ===============================
jest.mock('../../api/patientService', () => ({
  getMyProfile: jest.fn(),
  updatePatient: jest.fn(),
  updateMedicalHistory: jest.fn()
}));


// ===============================
// Render Helper
// ===============================
const renderPage = () => {
  render(<PatientProfile />);
};


// ===============================
// Tests
// ===============================
describe('PatientProfile', () => {

  beforeEach(() => {

    getMyProfile.mockResolvedValue({
      data: {
        id: 1,
        name: 'Aishwarya',
        email: 'aishu@gmail.com',
        phone: '9876543210',
        age: 22,
        bloodGroup: 'A+',
        address: 'Bangalore',
        medicalHistory: 'No history'
      }
    });

    updatePatient.mockResolvedValue({});
    updateMedicalHistory.mockResolvedValue({});
  });


  // Page Loads
  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/my profile/i)
    ).toBeInTheDocument();
  });


  // Email Visible
  test('email shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/aishu@gmail.com/i)
    ).toBeInTheDocument();
  });


  // Update Profile Button Exists
  test('update profile button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /update profile/i
      })
    ).toBeInTheDocument();
  });


  // Update Profile API Called
  test('update profile works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /update profile/i
      })
    );

    await waitFor(() => {
      expect(
        updatePatient
      ).toHaveBeenCalled();
    });
  });


  // Update History Works
  test('update history works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /update history/i
      })
    );

    await waitFor(() => {
      expect(
        updateMedicalHistory
      ).toHaveBeenCalled();
    });
  });

});