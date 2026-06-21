// =======================================
// DoctorPrescriptions.test.jsx
// =======================================

import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';

import DoctorPrescriptions from './DoctorPrescriptions';

import {
  getAllDoctors
} from '../../api/doctorService';

import {
  getAppointmentsByDoctor
} from '../../api/appointmentService';

import {
  getPrescriptionsByDoctor,
  addPrescription,
  updatePrescription
} from '../../api/prescriptionService';


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
// Mock FormInput
// ===============================
jest.mock('../../components/common/FormInput', () =>
  ({
    label,
    name,
    value,
    onChange,
    options,
    type = 'text'
  }) => (
    <div>
      <label htmlFor={name}>{label}</label>

      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="">Select</option>

          {options.map((o) => (
            <option
              key={o.value}
              value={o.value}
            >
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  )
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
  getAppointmentsByDoctor: jest.fn()
}));

jest.mock('../../api/prescriptionService', () => ({
  getPrescriptionsByDoctor: jest.fn(),
  addPrescription: jest.fn(),
  updatePrescription: jest.fn()
}));


// ===============================
// Render
// ===============================
const renderPage = () => {
  render(<DoctorPrescriptions />);
};


// ===============================
// Tests
// ===============================
describe('DoctorPrescriptions', () => {

  beforeEach(() => {

    getAllDoctors.mockResolvedValue({
      data: [
        {
          id: 1,
          email: 'ravi@gmail.com'
        }
      ]
    });

    getAppointmentsByDoctor.mockResolvedValue({
      data: [
        {
          id: 11,
          patientId: 101,
          patientName: 'Aishwarya',
          appointmentDate: '2026-05-02',
          slot: '10:00 AM',
          status: 'CONFIRMED'
        }
      ]
    });

    getPrescriptionsByDoctor.mockResolvedValue({
      data: [
        {
          id: 1,
          patientName: 'Aishwarya',
          diagnosis: 'Fever',
          medicines: 'Paracetamol',
          notes: 'After food',
          followUpDate: '2026-05-10'
        }
      ]
    });

    addPrescription.mockResolvedValue({
      data: { id: 2 }
    });

    updatePrescription.mockResolvedValue({
      data: { id: 1 }
    });

  });


  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/write new prescription/i)
    ).toBeInTheDocument();
  });


  test('patient shown', async () => {
    renderPage();

    const items =
      await screen.findAllByText(/aishwarya/i);

    expect(items.length).toBeGreaterThan(0);
  });


  test('existing diagnosis shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/fever/i)
    ).toBeInTheDocument();
  });


  test('add prescription works', async () => {
    renderPage();

    fireEvent.change(
      await screen.findByLabelText(/appointment/i),
      {
        target: { value: '11' }
      }
    );

    fireEvent.change(
      screen.getByLabelText(/^diagnosis$/i),
      {
        target: { value: 'Cold Fever' }
      }
    );

    fireEvent.change(
      screen.getByLabelText(/^medicines$/i),
      {
        target: { value: 'Paracetamol' }
      }
    );

    fireEvent.change(
      screen.getByLabelText(/follow up date/i),
      {
        target: { value: '2026-05-12' }
      }
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /add prescription/i
      })
    );

    await waitFor(() => {
      expect(
        addPrescription
      ).toHaveBeenCalled();
    });
  });


  test('edit button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /edit/i
      })
    ).toBeInTheDocument();
  });


  test('update prescription works', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /edit/i
      })
    );

    fireEvent.click(
      await screen.findByRole('button', {
        name: /save/i
      })
    );

    await waitFor(() => {
      expect(
        updatePrescription
      ).toHaveBeenCalled();
    });
  });

});