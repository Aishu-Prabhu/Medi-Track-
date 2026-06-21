// src/api/paymentService.js
// All payment-related API calls

import axiosInstance from './axiosInstance';

// Create Razorpay order — returns { id, orderId, amount, status }
export const createPayment = (appointmentId, amount, patientName = '', doctorName = '') =>
  axiosInstance.post('/payments/create', { appointmentId, amount, patientName, doctorName });

// Verify after Razorpay popup — returns updated Payment with status=SUCCESS
export const verifyPayment = (orderId, paymentId, signature) =>
  axiosInstance.post('/payments/verify', { orderId, paymentId, signature });

// Get all payments for a patient
export const getPaymentsByPatient = (patientId) =>
  axiosInstance.get(`/payments/patient/${patientId}`);

// Get single payment by id
export const getPaymentById = (id) =>
  axiosInstance.get(`/payments/${id}`);