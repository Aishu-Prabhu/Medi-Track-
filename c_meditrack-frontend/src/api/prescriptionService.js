// Covers all /prescriptions/** endpoints

import axiosInstance from './axiosInstance';

export const addPrescription = (data) =>
  axiosInstance.post('/prescriptions/add', data);

export const getPrescriptionById = (id) =>
  axiosInstance.get(`/prescriptions/${id}`);

export const getPrescriptionByAppointment = (appointmentId) =>
  axiosInstance.get(`/prescriptions/appointment/${appointmentId}`);

export const getPrescriptionsByPatient = (patientId) =>
  axiosInstance.get(`/prescriptions/patient/${patientId}`);

export const getPrescriptionsByDoctor = (doctorId) =>
  axiosInstance.get(`/prescriptions/doctor/${doctorId}`);

export const getAllPrescriptions = () =>
  axiosInstance.get('/prescriptions');

export const updatePrescription = (id, data) =>
  axiosInstance.put(`/prescriptions/${id}`, data);