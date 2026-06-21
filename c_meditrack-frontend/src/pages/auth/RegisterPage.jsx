// src/pages/auth/RegisterPage.jsx


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  User,
  Mail,
  Lock,
  Phone,
  HeartPulse,
  MapPin,
  ShieldCheck,
  UserPlus,
  Activity
} from 'lucide-react';

import { registerUser } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import {
  email as emailRule,
  required,
  passwordStrength,
  phone,
  bloodGroup,
  minLength
} from '../../utils/validators';

import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';

const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-'
];

function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { values, errors, handleChange, validate } = useForm(
    {
      name: '',
      email: '',
      password: '',
      phone: '',
      age: '',
      bloodGroup: '',
      address: ''
    },
    {
      name: minLength('Name', 2),
      email: emailRule,
      password: passwordStrength,
      phone,
      age: (v) =>
        !v || Number(v) < 1 || Number(v) > 120
          ? 'Age must be between 1 and 120'
          : '',
      bloodGroup,
      address: required('Address')
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      await registerUser(values);

      await Swal.fire({
  icon: 'success',
  title: 'Registration Successful',
  text: 'Your account has been created successfully.',
  confirmButtonColor: '#2563eb',
  confirmButtonText: 'Go to Login',
  background: '#ffffff',
  color: '#111827',
  timer: 2500,
  timerProgressBar: true
});

navigate('/login');
    } catch (err) {
      const data = err.response?.data;

      Swal.fire({
  icon: 'error',
  title: 'Registration Failed',
  text:
    data?.message ||
    data?.error ||
    'Something went wrong',
  confirmButtonColor: '#dc2626'
});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT SIDE */}
      <div style={styles.leftPanel}>
        <div style={styles.brandWrap}>
          <div style={styles.brandIcon}>
            <Activity size={34} color="#fff" />
          </div>

          <h1 style={styles.brandTitle}>MediTrack</h1>

          <p style={styles.brandText}>
            Hospital management platform for appointments,
            patients, prescriptions, billing and seamless care.
          </p>

          <div style={styles.featureBox}>
            <div style={styles.featureItem}>
              <ShieldCheck size={18} />
              Secure Patient Registration
            </div>

            <div style={styles.featureItem}>
              <HeartPulse size={18} />
              Digital Health Records
            </div>

            <div style={styles.featureItem}>
              <UserPlus size={18} />
              Fast Onboarding Experience
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.headerIcon}>
              <UserPlus size={22} color="#2563eb" />
            </div>

            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>
              Register as patient to access MediTrack services
            </p>
          </div>

          <Alert
            type="error"
            message={apiError}
            onClose={() => setApiError('')}
          />

          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.inputWrap}>
              <div style={styles.inputIcon}>
                <User size={16} />
              </div>
              <FormInput
                label="Full Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter full name"
                required
              />
            </div>

            <div style={styles.inputWrap}>
              <div style={styles.inputIcon}>
                <Mail size={16} />
              </div>
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="user@gmail.com"
                required
              />
            </div>

            <div style={styles.inputWrap}>
              <div style={styles.inputIcon}>
                <Lock size={16} />
              </div>
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Strong password"
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.half}>
                <div style={styles.inputWrap}>
                  <div style={styles.inputIcon}>
                    <Phone size={16} />
                  </div>
                  <FormInput
                    label="Phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="10-digit number"
                    required
                  />
                </div>
              </div>

              <div style={styles.half}>
                <FormInput
                  label="Age"
                  name="age"
                  type="number"
                  value={values.age}
                  onChange={handleChange}
                  error={errors.age}
                  min="1"
                  max="120"
                  placeholder="Age"
                  required
                />
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.half}>
                <FormInput
                  label="Blood Group"
                  name="bloodGroup"
                  value={values.bloodGroup}
                  onChange={handleChange}
                  error={errors.bloodGroup}
                  options={BLOOD_GROUPS}
                  required
                />
              </div>

              <div style={styles.half}>
                <div style={styles.inputWrap}>
                  <div style={styles.inputIcon}>
                    <MapPin size={16} />
                  </div>
                  <FormInput
                    label="Address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="City / Area"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.btn,
                opacity: loading ? 0.8 : 1
              }}
            >
              <UserPlus size={18} />
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <p style={styles.foot}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns: '1fr 560px',
    background:
      'linear-gradient(135deg,#0f172a 0%,#1e3a8a 45%,#2563eb 100%)'
  },

  leftPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px'
  },

  brandWrap: {
    maxWidth: '540px',
    color: '#fff'
  },

  brandIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background: 'rgba(255,255,255,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px'
  },

  brandTitle: {
    margin: 0,
    fontSize: '56px',
    fontWeight: '800'
  },

  brandText: {
    marginTop: '18px',
    fontSize: '18px',
    lineHeight: '1.7',
    color: 'rgba(255,255,255,0.86)'
  },

  featureBox: {
    marginTop: '34px',
    display: 'grid',
    gap: '14px'
  },

  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.12)'
  },

  rightPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    background: 'rgba(255,255,255,0.05)'
  },

  card: {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '95vh',
    overflowY: 'auto',
    background: '#fff',
    borderRadius: '26px',
    padding: '32px',
    boxShadow: '0 25px 70px rgba(0,0,0,0.18)'
  },

  header: {
    textAlign: 'center',
    marginBottom: '20px'
  },

  headerIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px'
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800',
    color: '#0f172a'
  },

  subtitle: {
    marginTop: '8px',
    color: '#64748b',
    fontSize: '14px'
  },

  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px'
  },

  half: {
    width: '100%'
  },

  inputWrap: {
    position: 'relative'
  },

  inputIcon: {
    position: 'absolute',
    right: '14px',
    top: '42px',
    zIndex: 2,
    color: '#94a3b8'
  },

  btn: {
    width: '100%',
    height: '52px',
    marginTop: '16px',
    border: 'none',
    borderRadius: '14px',
    background:
      'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    boxShadow: '0 14px 28px rgba(37,99,235,0.25)'
  },

  foot: {
    textAlign: 'center',
    marginTop: '18px',
    fontSize: '14px',
    color: '#64748b'
  },

  link: {
    color: '#2563eb',
    fontWeight: '700',
    textDecoration: 'none'
  }
};

export default RegisterPage;