import axiosInstance from "./axiosInstance";

/* ===============================
   PATIENT NOTIFICATIONS
================================= */

// Get all patient notifications
export const getMyNotifications = (patientId) =>
  axiosInstance.get(`/notifications/patient/${patientId}`);

// Patient unread count
export const getUnreadCount = (patientId) =>
  axiosInstance.get(`/notifications/unread/${patientId}`);

/* ===============================
   DOCTOR NOTIFICATIONS
================================= */

// Get all doctor notifications
export const getDoctorNotifications = (doctorId) =>
  axiosInstance.get(`/notifications/doctor/${doctorId}`);

// Doctor unread count
export const getDoctorUnreadCount = (doctorId) =>
  axiosInstance.get(`/notifications/doctor/unread/${doctorId}`);

/* ===============================
   COMMON
================================= */

// Mark single notification as read
export const markNotificationRead = (id) =>
  axiosInstance.put(`/notifications/read/${id}`);