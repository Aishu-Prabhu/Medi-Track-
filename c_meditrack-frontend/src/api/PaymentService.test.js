// =======================================
// paymentService.test.js
// Tests for paymentService.js
// =======================================

import axiosInstance from './axiosInstance';
import {
  createPayment,
  verifyPayment,
  getPaymentsByPatient,
  getPaymentById
} from './paymentService';

jest.mock('./axiosInstance');

describe('paymentService.js', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CREATE PAYMENT
  test('createPayment should call POST /payments/create with full data', async () => {
    axiosInstance.post.mockResolvedValue({ data: {} });

    await createPayment(
      101,
      1500,
      'Aishwarya',
      'Dr John'
    );

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/payments/create',
      {
        appointmentId: 101,
        amount: 1500,
        patientName: 'Aishwarya',
        doctorName: 'Dr John'
      }
    );
  });

  test('createPayment should use default empty names if not provided', async () => {
    axiosInstance.post.mockResolvedValue({ data: {} });

    await createPayment(102, 2000);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/payments/create',
      {
        appointmentId: 102,
        amount: 2000,
        patientName: '',
        doctorName: ''
      }
    );
  });

  // VERIFY PAYMENT
  test('verifyPayment should call POST /payments/verify', async () => {
    axiosInstance.post.mockResolvedValue({ data: {} });

    await verifyPayment(
      'order_123',
      'pay_456',
      'signature_789'
    );

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/payments/verify',
      {
        orderId: 'order_123',
        paymentId: 'pay_456',
        signature: 'signature_789'
      }
    );
  });

  // GET PAYMENTS BY PATIENT
  test('getPaymentsByPatient should call GET /payments/patient/{patientId}', async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await getPaymentsByPatient(55);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/payments/patient/55'
    );
  });

  // GET PAYMENT BY ID
  test('getPaymentById should call GET /payments/{id}', async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await getPaymentById(9);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/payments/9'
    );
  });

});