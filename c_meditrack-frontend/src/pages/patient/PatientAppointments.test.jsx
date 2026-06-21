import {
  render,
  screen,
  waitFor,
  fireEvent
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import PatientAppointments from './PatientAppointments';

import {
  getAppointmentsByPatient,
  cancelAppointment
} from '../../api/appointmentService';

import {
  getMyProfile
} from '../../api/patientService';

jest.mock('../../components/common/Spinner', () => () =>
  <div>Loading...</div>
);

jest.mock('../../components/common/Alert', () => ({ message }) =>
  message ? <div>{message}</div> : null
);

jest.mock('../../api/appointmentService', () => ({
  getAppointmentsByPatient: jest.fn(),
  cancelAppointment: jest.fn()
}));

jest.mock('../../api/patientService', () => ({
  getMyProfile: jest.fn()
}));

const renderPage = () => {
  render(
    <BrowserRouter>
      <PatientAppointments />
    </BrowserRouter>
  );
};

describe('PatientAppointments', () => {

  beforeEach(() => {

    getMyProfile.mockResolvedValue({
      data: { id: 1 }
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

  });

  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/my appointments/i)
    ).toBeInTheDocument();
  });

  test('doctor names shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/ravi kumar/i)
    ).toBeInTheDocument();
  });

  test('api called properly', async () => {
    renderPage();

    await waitFor(() => {
      expect(getMyProfile).toHaveBeenCalled();
      expect(getAppointmentsByPatient).toHaveBeenCalledWith(1);
    });
  });

  test('cancel button shown', async () => {
    renderPage();

    const btns = await screen.findAllByRole('button');

    expect(btns.length).toBeGreaterThan(0);
  });

  test('cancel modal opens', async () => {
    renderPage();

    const btns = await screen.findAllByRole('button');

    fireEvent.click(btns[0]);

    expect(
      await screen.findByText(/confirm cancel/i)
    ).toBeInTheDocument();
  });

});