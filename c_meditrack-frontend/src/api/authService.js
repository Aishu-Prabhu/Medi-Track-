// Covers:
// POST   /auth/register
// POST   /auth/login
// POST   /auth/admin/create-doctor
// POST   /auth/admin/create-admin
// GET    /auth/user/email/{email}
// GET    /auth/admin/all
// GET    /auth/admin/{id}
// PUT    /auth/admin/update-admin/{id}
// DELETE /auth/admin/delete-admin/{id}
// PUT    /auth/admin/reset-password/{id}

import axiosInstance from './axiosInstance';

// LOGIN
export const loginUser = (email, password) =>
  axiosInstance.post('/auth/login', { email, password });

// PATIENT REGISTER
export const registerUser = (data) =>
  axiosInstance.post('/auth/register', data);

// CREATE DOCTOR
export const createDoctor = (data) =>
  axiosInstance.post('/auth/admin/create-doctor', data);

// CREATE ADMIN
export const createAdmin = (data) =>
  axiosInstance.post('/auth/admin/create-admin', data);

// GET USER BY EMAIL
export const getUserByEmail = (email) =>
  axiosInstance.get(`/auth/user/email/${email}`);

// GET ALL ADMINS
export const getAllAdmins = () =>
  axiosInstance.get('/auth/admin/all');

// GET ADMIN BY ID
export const getAdminById = (id) =>
  axiosInstance.get(`/auth/admin/${id}`);

// UPDATE ADMIN
export const updateAdmin = (id, data) =>
  axiosInstance.put(`/auth/admin/update-admin/${id}`, data);

// DELETE ADMIN
export const deleteAdmin = (id) =>
  axiosInstance.delete(`/auth/admin/delete-admin/${id}`);

// RESET ADMIN PASSWORD
export const resetAdminPassword = (id, password) =>
  axiosInstance.put(
    `/auth/admin/reset-password/${id}?password=${encodeURIComponent(password)}`
  );