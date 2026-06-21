// Covers all /doctors/** endpoints

import axiosInstance from './axiosInstance';

export const addDoctor = (data) =>
  axiosInstance.post('/doctors/add', data);

export const getDoctorById = (id) =>
  axiosInstance.get(`/doctors/${id}`);

export const getAllDoctors = () =>
  axiosInstance.get('/doctors/all');

export const getAvailableDoctors = () =>
  axiosInstance.get('/doctors/available');

export const getDoctorsBySpecialization = (spec) =>
  axiosInstance.get(`/doctors/specialization/${spec}`);

export const updateDoctor = (id, data) =>
  axiosInstance.put(`/doctors/update/${id}`, data);

export const deleteDoctor = (id) =>
  axiosInstance.delete(`/doctors/delete/${id}`);

export const toggleDoctorAvailability = (id) =>
  axiosInstance.put(`/doctors/toggle-availability/${id}`);

export const getDoctorByEmail = (email) =>
  axiosInstance.get(`/doctors/email/${email}`);