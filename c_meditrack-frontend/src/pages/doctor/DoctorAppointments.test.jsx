// src/pages/doctor/DoctorAppointments.test.jsx

import React from 'react';

import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';

import '@testing-library/jest-dom';

import DoctorAppointments
from './DoctorAppointments';

import { useAuth }
from '../../context/AuthContext';

import { getAllDoctors }
from '../../api/doctorService';

import {
  getAppointmentsByDoctor,
  cancelAppointment,
  completeAppointment,
} from '../../api/appointmentService';

import { getPatientById }
from '../../api/patientService';

import Swal from 'sweetalert2';

// ============================
// MOCKS
// ============================

jest.mock('../../context/AuthContext');

jest.mock('../../api/doctorService');

jest.mock('../../api/appointmentService');

jest.mock('../../api/patientService');

jest.mock('../../components/common/Spinner', () =>
  () => <div>Loading...</div>
);

jest.mock('../../components/common/Alert', () =>
  ({ message }) =>
    message
      ? <div>{message}</div>
      : null
);

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));

// ============================
// TEST DATA
// ============================

const mockDoctor = {
  id: 1,
  email: 'doctor@gmail.com',
  name: 'Dr Raj',
};

const mockAppointments = [
  {
    id: 101,
    patientId: 11,
    patientName: 'John Doe',
    appointmentDate: '2026-05-16',
    slot: '10:00 AM',
    status: 'CONFIRMED',
  },
  {
    id: 102,
    patientId: 12,
    patientName: 'Jane Doe',
    appointmentDate: '2026-05-17',
    slot: '11:00 AM',
    status: 'COMPLETED',
  },
];

const mockPatient = {
  id: 11,
  name: 'John Doe',
  age: 25,
  bloodGroup: 'O+',
  phone: '9876543210',
  medicalHistory: 'Diabetes',
};

// ============================
// SETUP
// ============================

beforeEach(() => {

  jest.clearAllMocks();

  useAuth.mockReturnValue({
    user: {
      email: 'doctor@gmail.com',
    },
  });

  getAllDoctors.mockResolvedValue({
    data: [mockDoctor],
  });

  getAppointmentsByDoctor.mockResolvedValue({
    data: mockAppointments,
  });
});

// ============================
// TESTS
// ============================

describe('DoctorAppointments', () => {

  test('renders loading spinner initially', () => {

    render(<DoctorAppointments />);

    expect(
      screen.getByText(/loading/i)
    ).toBeInTheDocument();
  });

  test('loads and displays appointments', async () => {

    render(<DoctorAppointments />);

    expect(
      await screen.findByText('John Doe')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Jane Doe')
    ).toBeInTheDocument();

    expect(
      screen.getByText(/my appointments/i)
    ).toBeInTheDocument();
  });

  test('shows no appointments message', async () => {

    getAppointmentsByDoctor.mockResolvedValue({
      data: [],
    });

    render(<DoctorAppointments />);

    expect(
      await screen.findByText(
        /no appointments yet/i
      )
    ).toBeInTheDocument();
  });

  test('shows error if appointments fail to load', async () => {

    getAppointmentsByDoctor.mockRejectedValue(
      new Error('API Error')
    );

    render(<DoctorAppointments />);

    expect(
      await screen.findByText(
        /failed to load appointments/i
      )
    ).toBeInTheDocument();
  });

  test('opens patient history modal', async () => {

    getPatientById.mockResolvedValue({
      data: mockPatient,
    });

    render(<DoctorAppointments />);

    const historyBtn =
      await screen.findAllByText(/history/i);

    fireEvent.click(historyBtn[0]);

    expect(
      await screen.findByText(
        /patient history/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(/diabetes/i)
    ).toBeInTheDocument();
  });

  test('handles patient history API failure', async () => {

    getPatientById.mockRejectedValue(
      new Error('API Error')
    );

    render(<DoctorAppointments />);

    const historyBtn =
      await screen.findAllByText(/history/i);

    fireEvent.click(historyBtn[0]);

    expect(
      await screen.findByText(
        /failed to load patient history/i
      )
    ).toBeInTheDocument();
  });

  test('cancel appointment successfully', async () => {

    Swal.fire.mockResolvedValue({
      value: 'Doctor unavailable',
    });

    cancelAppointment.mockResolvedValue({
      data: {
        ...mockAppointments[0],
        status: 'CANCELLED',
      },
    });

    render(<DoctorAppointments />);

    const cancelBtn =
      await screen.findByRole(
        'button',
        { name: /cancel/i }
      );

    fireEvent.click(cancelBtn);

    await waitFor(() => {

      expect(cancelAppointment)
        .toHaveBeenCalledWith(
          101,
          'Doctor unavailable'
        );
    });
  });

  test('cancel appointment failure', async () => {

    Swal.fire.mockResolvedValue({
      value: 'Emergency leave',
    });

    cancelAppointment.mockRejectedValue(
      new Error('API Error')
    );

    render(<DoctorAppointments />);

    const cancelBtn =
      await screen.findByRole(
        'button',
        { name: /cancel/i }
      );

    fireEvent.click(cancelBtn);

    expect(
      await screen.findByText(
        /cancellation failed/i
      )
    ).toBeInTheDocument();
  });

  test('does not cancel when no reason selected', async () => {

    Swal.fire.mockResolvedValue({
      value: null,
    });

    render(<DoctorAppointments />);

    const cancelBtn =
      await screen.findByRole(
        'button',
        { name: /cancel/i }
      );

    fireEvent.click(cancelBtn);

    await waitFor(() => {

      expect(cancelAppointment)
        .not.toHaveBeenCalled();
    });
  });


});