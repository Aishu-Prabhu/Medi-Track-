// Covers all /patients/** endpoints

import axiosInstance from './axiosInstance';

export const addPatient = (data) =>
  axiosInstance.post('/patients/add', data);

export const getMyProfile = () =>
  axiosInstance.get('/patients/me');

export const getPatientById = (id) =>
  axiosInstance.get(`/patients/id/${id}`);

export const getAllPatients = () =>
  axiosInstance.get('/patients/all');

export const updatePatient = (id, data) =>
  axiosInstance.put(`/patients/update/${id}`, data);

export const deletePatient = (id) =>
  axiosInstance.delete(`/patients/delete/${id}`);

export const updateMedicalHistory = (id, history) =>
  axiosInstance.put(`/patients/update-history/${id}`, null, {
    params: { history },
  });

export const getPatientByEmail = (email) =>
  axiosInstance.get(`/patients/email/${email}`);

export const resgisterProfile = (data)=>
    axiosInstance.post(`/patients/register-profile`,data);

