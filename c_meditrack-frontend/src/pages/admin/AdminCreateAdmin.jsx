// src/pages/admin/AdminCreateAdmin.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  UserRound,
  Mail,
  Lock,
  ShieldCheck,
} from 'lucide-react';

import { createAdmin } from '../../api/authService';
import { useForm } from '../../hooks/useForm';

import {
  email as emailRule,
  minLength,
} from '../../utils/validators';

import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';

function AdminCreateAdmin() {
  const navigate = useNavigate();

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const {
    values,
    errors,
    handleChange,
    validate,
    reset,
  } = useForm(
    {
      name: '',
      email: '',
      password: '',
    },
    {
      name: minLength(
        'Name',
        2
      ),

      email: emailRule,

      password: (v) =>
        !v || v.length < 6
          ? 'Password must be at least 6 characters'
          : '',
    }
  );

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await createAdmin({
        name: values.name,
        email:
          values.email,
        password:
          values.password,
      });

      setSuccess(
        `Admin account created for ${values.email}`
      );

      reset();
    } catch (err) {
      const msg =
        err.response?.data
          ?.message ||
        (typeof err.response
          ?.data ===
        'string'
          ? err.response
              .data
          : JSON.stringify(
              err.response
                ?.data
            )) ||
        'Failed to create admin';

      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* BACK */}
      <button
        onClick={() =>
          navigate(
            '/admin/dashboard'
          )
        }
        style={styles.backBtn}
      >
        ← Back to Dashboard
      </button>

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <Shield size={26} />
          </div>

          <h1 style={styles.title}>
            Create Admin Account
          </h1>

          <p style={styles.subtitle}>
            Add authorized
            administrators to
            manage operations,
            doctors, patients and
            hospital workflows.
          </p>
        </div>

        <div style={styles.heroMini}>
          <ShieldCheck size={54} />
        </div>
      </div>

      <Alert
        type="success"
        message={success}
        onClose={() =>
          setSuccess('')
        }
      />

      <Alert
        type="error"
        message={error}
        onClose={() =>
          setError('')
        }
      />

      {/* FORM */}
      <div style={styles.card}>
        <form
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <InputWrap
            icon={
              <UserRound
                size={16}
              />
            }
          >
            <FormInput
              label="Full Name"
              name="name"
              value={
                values.name
              }
              onChange={
                handleChange
              }
              error={
                errors.name
              }
              placeholder="Admin Name"
              required
            />
          </InputWrap>

          <InputWrap
            icon={
              <Mail
                size={16}
              />
            }
          >
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={
                values.email
              }
              onChange={
                handleChange
              }
              error={
                errors.email
              }
              placeholder="admin@meditrack.com"
              required
            />
          </InputWrap>

          <InputWrap
            icon={
              <Lock
                size={16}
              />
            }
          >
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={
                values.password
              }
              onChange={
                handleChange
              }
              error={
                errors.password
              }
              placeholder="Minimum 6 characters"
              required
            />
          </InputWrap>

          <button
            type="submit"
            disabled={saving}
            style={styles.btn}
          >
            <Shield size={16} />
            {saving
              ? 'Creating...'
              : 'Create Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputWrap({
  icon,
  children,
}) {
  return (
    <div
      style={
        styles.inputWrap
      }
    >
      <div
        style={
          styles.inputIcon
        }
      >
        {icon}
      </div>

      {children}
    </div>
  );
}



const styles = {
  page: {
    padding: '28px',
    background: '#f4f7fb',
    minHeight: '100vh',
    maxWidth: '760px',
  },

  backBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#1565C0,#1976D2)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    marginBottom: '20px',
  },

  hero: {
    background:
      'linear-gradient(135deg,#0d47a1,#1565C0,#1e88e5)',
    color: '#fff',
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '22px',
    boxShadow:
      '0 18px 40px rgba(21,101,192,.18)',
  },

  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '18px',
    background:
      'rgba(255,255,255,.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800',
  },

  subtitle: {
    marginTop: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    maxWidth: '620px',
    color:
      'rgba(255,255,255,.88)',
  },

  heroMini: {
    opacity: 0.22,
  },

  card: {
    background: '#fff',
    borderRadius: '22px',
    padding: '26px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
  },

  inputWrap: {
    position: 'relative',
  },

  inputIcon: {
    position: 'absolute',
    right: '14px',
    top: '42px',
    zIndex: 2,
    color: '#94a3b8',
  },

  btn: {
    width: '100%',
    marginTop: '14px',
    border: 'none',
    background:
      'linear-gradient(135deg,#1565C0,#1976D2)',
    color: '#fff',
    padding: '14px 18px',
    borderRadius: '14px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow:
      '0 12px 24px rgba(21,101,192,.18)',
  },
};
export default AdminCreateAdmin;