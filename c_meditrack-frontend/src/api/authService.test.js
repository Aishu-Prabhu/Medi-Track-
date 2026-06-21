// =======================================
// authService.test.js
// Tests for authService.js
// =======================================

import axiosInstance from './axiosInstance';
import {
  loginUser,
  registerUser,
  createDoctor,
  createAdmin,
  getUserByEmail,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  resetAdminPassword
} from './authService';

jest.mock('./axiosInstance');

describe('authService.js', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // LOGIN
  test('loginUser should call POST /auth/login', async () => {
    axiosInstance.post.mockResolvedValue({ data: {} });

    await loginUser('test@gmail.com', '1234');

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/auth/login',
      {
        email: 'test@gmail.com',
        password: '1234'
      }
    );
  });

  // REGISTER
  test('registerUser should call POST /auth/register', async () => {
    const userData = {
      name: 'Aishu',
      email: 'aishu@gmail.com',
      password: '1234'
    };

    axiosInstance.post.mockResolvedValue({ data: {} });

    await registerUser(userData);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/auth/register',
      userData
    );
  });

  // CREATE DOCTOR
  test('createDoctor should call POST /auth/admin/create-doctor', async () => {
    const doctorData = {
      name: 'Dr John',
      email: 'john@gmail.com'
    };

    axiosInstance.post.mockResolvedValue({ data: {} });

    await createDoctor(doctorData);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/auth/admin/create-doctor',
      doctorData
    );
  });

  // CREATE ADMIN
  test('createAdmin should call POST /auth/admin/create-admin', async () => {
    const adminData = {
      name: 'Admin',
      email: 'admin@gmail.com'
    };

    axiosInstance.post.mockResolvedValue({ data: {} });

    await createAdmin(adminData);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      '/auth/admin/create-admin',
      adminData
    );
  });

  // GET USER BY EMAIL
  test('getUserByEmail should call GET /auth/user/email/{email}', async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await getUserByEmail('user@gmail.com');

    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/auth/user/email/user@gmail.com'
    );
  });

  // GET ALL ADMINS
  test('getAllAdmins should call GET /auth/admin/all', async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await getAllAdmins();

    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/auth/admin/all'
    );
  });

  // GET ADMIN BY ID
  test('getAdminById should call GET /auth/admin/{id}', async () => {
    axiosInstance.get.mockResolvedValue({ data: {} });

    await getAdminById(10);

    expect(axiosInstance.get).toHaveBeenCalledWith(
      '/auth/admin/10'
    );
  });

  // UPDATE ADMIN
  test('updateAdmin should call PUT /auth/admin/update-admin/{id}', async () => {
    const updateData = {
      name: 'Updated Admin'
    };

    axiosInstance.put.mockResolvedValue({ data: {} });

    await updateAdmin(5, updateData);

    expect(axiosInstance.put).toHaveBeenCalledWith(
      '/auth/admin/update-admin/5',
      updateData
    );
  });

  // DELETE ADMIN
  test('deleteAdmin should call DELETE /auth/admin/delete-admin/{id}', async () => {
    axiosInstance.delete.mockResolvedValue({ data: {} });

    await deleteAdmin(3);

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      '/auth/admin/delete-admin/3'
    );
  });

  // RESET PASSWORD
  test('resetAdminPassword should call PUT with encoded password', async () => {
    axiosInstance.put.mockResolvedValue({ data: {} });

    await resetAdminPassword(7, 'pass@123');

    expect(axiosInstance.put).toHaveBeenCalledWith(
      '/auth/admin/reset-password/7?password=pass%40123'
    );
  });

});