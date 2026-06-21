// =======================================
// PatientPrescriptions.test.jsx
// Exact test for YOUR real page
// =======================================

import {
  render,
  screen,
  waitFor,
  fireEvent
} from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';

import PatientPrescriptions from './PatientPrescriptions';

import {
  getMyProfile
} from '../../api/patientService';

import {
  getPrescriptionsByPatient
} from '../../api/prescriptionService';

import {
  downloadPrescriptionPDF
} from '../../utils/pdfUtils';


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
jest.mock('../../api/patientService', () => ({
  getMyProfile: jest.fn()
}));

jest.mock('../../api/prescriptionService', () => ({
  getPrescriptionsByPatient: jest.fn()
}));

jest.mock('../../utils/pdfUtils', () => ({
  downloadPrescriptionPDF: jest.fn()
}));


// ===============================
// Render Helper
// ===============================
const renderPage = () => {
  render(
    <BrowserRouter>
      <PatientPrescriptions />
    </BrowserRouter>
  );
};


// ===============================
// Tests
// ===============================
describe('PatientPrescriptions', () => {

  beforeEach(() => {

    getMyProfile.mockResolvedValue({
      data: {
        id: 1,
        name: 'Aishwarya'
      }
    });

    getPrescriptionsByPatient.mockResolvedValue({
      data: [
        {
          id: 1,
          doctorName: 'Ravi Kumar',
          prescriptionDate: '2026-05-02',
          diagnosis: 'Fever',
          medicines: 'Paracetamol',
          notes: 'Take after food',
          followUpDate: '2026-05-10'
        }
      ]
    });

  });


  // Page Loads
  test('page loads', async () => {
    renderPage();

    expect(
      await screen.findByText(/my prescriptions/i)
    ).toBeInTheDocument();
  });


  // Doctor Name Visible
  test('doctor name shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/ravi kumar/i)
    ).toBeInTheDocument();
  });


  // Diagnosis Visible
  test('diagnosis shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/fever/i)
    ).toBeInTheDocument();
  });


  // Medicine Visible
  test('medicine shown', async () => {
    renderPage();

    expect(
      await screen.findByText(/paracetamol/i)
    ).toBeInTheDocument();
  });


  // Download Button Visible
  test('download button shown', async () => {
    renderPage();

    expect(
      await screen.findByRole('button', {
        name: /download pdf/i
      })
    ).toBeInTheDocument();
  });


  // Download Function Called
  test('download called', async () => {
    renderPage();

    fireEvent.click(
      await screen.findByRole('button', {
        name: /download pdf/i
      })
    );

    await waitFor(() => {
      expect(
        downloadPrescriptionPDF
      ).toHaveBeenCalled();
    });
  });

});