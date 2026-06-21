// src/App.js

import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

/* =========================
   AUTH PAGES
========================= */
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/* =========================
   PATIENT PAGES
========================= */
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import BookAppointment from './pages/patient/BookAppointment';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientPayments from './pages/patient/PatientPayments';

/* =========================
   DOCTOR PAGES
========================= */
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import DoctorSlots from './pages/doctor/DoctorSlots';

/* =========================
   ADMIN PAGES
========================= */
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminPatients from './pages/admin/AdminPatients';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminSlots from './pages/admin/AdminSlots';
import AdminCreateDoctor from './pages/admin/AdminCreateDoctor';
import AdminCreateAdmin from './pages/admin/AdminCreateAdmin';
import AdminAdmins from './pages/admin/AdminAdmins';

/* =========================
   PROTECTED WRAPPER
========================= */
function P({ roles, children }) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

/* =========================
   APP
========================= */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =====================
              PUBLIC ROUTES
          ===================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* =====================
              PATIENT ROUTES
          ===================== */}
          <Route
            path="/patient/dashboard"
            element={
              <P roles={['PATIENT']}>
                <PatientDashboard />
              </P>
            }
          />

          <Route
            path="/patient/profile"
            element={
              <P roles={['PATIENT']}>
                <PatientProfile />
              </P>
            }
          />

          <Route
            path="/patient/appointments"
            element={
              <P roles={['PATIENT']}>
                <PatientAppointments />
              </P>
            }
          />

          <Route
            path="/patient/book-appointment"
            element={
              <P roles={['PATIENT']}>
                <BookAppointment />
              </P>
            }
          />

          <Route
            path="/patient/prescriptions"
            element={
              <P roles={['PATIENT']}>
                <PatientPrescriptions />
              </P>
            }
          />

          <Route
            path="/patient/payments"
            element={
              <P roles={['PATIENT']}>
                <PatientPayments />
              </P>
            }
          />

          {/* =====================
              DOCTOR ROUTES
          ===================== */}
          <Route
            path="/doctor/dashboard"
            element={
              <P roles={['DOCTOR']}>
                <DoctorDashboard />
              </P>
            }
          />

          <Route
            path="/doctor/appointments"
            element={
              <P roles={['DOCTOR']}>
                <DoctorAppointments />
              </P>
            }
          />

          <Route
            path="/doctor/prescriptions"
            element={
              <P roles={['DOCTOR']}>
                <DoctorPrescriptions />
              </P>
            }
          />

          <Route
            path="/doctor/slots"
            element={
              <P roles={['DOCTOR']}>
                <DoctorSlots />
              </P>
            }
          />

          {/* =====================
              ADMIN + SUPER ADMIN
          ===================== */}
          <Route
            path="/admin/dashboard"
            element={
              <P roles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDashboard />
              </P>
            }
          />

          <Route
            path="/admin/doctors"
            element={
              <P roles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminDoctors />
              </P>
            }
          />

          <Route
            path="/admin/patients"
            element={
              <P roles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminPatients />
              </P>
            }
          />

          <Route
            path="/admin/appointments"
            element={
              <P roles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminAppointments />
              </P>
            }
          />

          <Route
            path="/admin/slots"
            element={
              <P roles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminSlots />
              </P>
            }
          />

          <Route
            path="/admin/create-doctor"
            element={
              <P roles={['ADMIN', 'SUPER_ADMIN']}>
                <AdminCreateDoctor />
              </P>
            }
          />

          {/* =====================
              VIEW ALL ADMINS
              (ADMIN + SUPER_ADMIN)
          ===================== */}
          <Route
  path="/admin/admins"
  element={
    <P roles={['ADMIN', 'SUPER_ADMIN']}>
      <AdminAdmins />
    </P>
  }
/>

          {/* =====================
              CREATE ADMIN
              ONLY SUPER_ADMIN
          ===================== */}
          <Route
            path="/admin/create-admin"
            element={
              <P roles={['SUPER_ADMIN']}>
                <AdminCreateAdmin />
              </P>
            }
          />

          {/* =====================
              FALLBACK
          ===================== */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;