// src/api/appointmentService.js

import axiosInstance from './axiosInstance';

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────
export const bookAppointment = (data) =>
  axiosInstance.post('/appointments/book', data);

export const getAppointmentById = (id) =>
  axiosInstance.get(`/appointments/${id}`);

export const getAllAppointments = () =>
  axiosInstance.get('/appointments/all');

export const getAppointmentsByPatient = (patientId) =>
  axiosInstance.get(`/appointments/patient/${patientId}`);

export const getAppointmentsByDoctor = (doctorId) =>
  axiosInstance.get(`/appointments/doctor/${doctorId}`);

// Sends { reason } in request body — matches CancelRequest DTO on backend
export const cancelAppointment = (id, reason = 'No reason provided') =>
  axiosInstance.put(`/appointments/cancel/${id}`, { reason });

export const completeAppointment = (id) =>
  axiosInstance.put(`/appointments/complete/${id}`);

export const markPaymentSuccess = (id) =>
  axiosInstance.put(`/appointments/payment-success/${id}`);

// ── SLOTS ─────────────────────────────────────────────────────────────────────
export const generateSlots = (doctorId, date) =>
  axiosInstance.post(`/slots/generate/${doctorId}`, null, { params: { date } });

export const getAllSlots = (doctorId, date) =>
  axiosInstance.get(`/slots/doctor/${doctorId}`, { params: { date } });

export const getAvailableSlots = (doctorId, date) =>
  axiosInstance.get(`/slots/doctor/${doctorId}/available`, { params: { date } });