// src/pages/admin/AdminCreateDoctor.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  UserRound,
  Mail,
  Lock,
  Phone,
  Stethoscope,
  GraduationCap,
  BriefcaseMedical,
  ShieldCheck,
} from 'lucide-react';

import { createDoctor as createAuthDoctor } from '../../api/authService';
import { addDoctor } from '../../api/doctorService';

import { useForm } from '../../hooks/useForm';

import {
  email as emailRule,
  required,
  phone,
  minLength,
} from '../../utils/validators';

import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';

const SPECIALIZATIONS = [
  'CARDIOLOGIST',
  'DERMATOLOGIST',
  'ORTHOPEDIC',
  'NEUROLOGIST',
  'ONCOLOGIST',
  'PEDIATRICIAN',
  'GENERAL_PHYSICIAN',
];

function AdminCreateDoctor() {
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
      phone: '',
      specialization: '',
      experience: '',
      qualification: '',
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

      phone,

      specialization:
        required(
          'Specialization'
        ),

      qualification:
        required(
          'Qualification'
        ),

      experience: (v) =>
        v === '' ||
        v === undefined
          ? ''
          : Number(v) < 0 ||
            Number(v) > 60
          ? 'Experience must be 0 to 60 years'
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
      await createAuthDoctor({
        name: values.name,
        email:
          values.email,
        password:
          values.password,
      });

      await addDoctor({
        name: values.name,
        email:
          values.email,
        phone:
          values.phone,
        specialization:
          values.specialization,
        experience:
          Number(
            values.experience
          ) || 0,
        qualification:
          values.qualification,
      });

      setSuccess(
        `Dr. ${values.name} created successfully!`
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
        'Failed to create doctor';

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
            <UserPlus size={26} />
          </div>

          <h1 style={styles.title}>
            Add New Doctor
          </h1>

          <p style={styles.subtitle}>
            Create doctor login
            credentials and
            professional profile
            details for hospital
            operations.
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

      {/* FORM CARD */}
      <div style={styles.card}>
        <form
          onSubmit={
            handleSubmit
          }
          noValidate
        >
          <div style={styles.grid}>
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
                placeholder="Dr. Ravi Kumar"
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
                placeholder="doctor@hospital.com"
                required
              />
            </InputWrap>
          </div>

          <div style={styles.grid}>
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
                placeholder="Temporary password"
                required
              />
            </InputWrap>

            <InputWrap
              icon={
                <Phone
                  size={16}
                />
              }
            >
              <FormInput
                label="Phone"
                name="phone"
                value={
                  values.phone
                }
                onChange={
                  handleChange
                }
                error={
                  errors.phone
                }
                placeholder="10 digit mobile"
                required
              />
            </InputWrap>
          </div>

          <div style={styles.grid}>
            <InputWrap
              icon={
                <Stethoscope
                  size={16}
                />
              }
            >
              <FormInput
                label="Specialization"
                name="specialization"
                value={
                  values.specialization
                }
                onChange={
                  handleChange
                }
                error={
                  errors.specialization
                }
                options={
                  SPECIALIZATIONS
                }
                required
              />
            </InputWrap>

            <InputWrap
              icon={
                <BriefcaseMedical
                  size={16}
                />
              }
            >
              <FormInput
                label="Experience (Years)"
                name="experience"
                type="number"
                value={
                  values.experience
                }
                onChange={
                  handleChange
                }
                error={
                  errors.experience
                }
                min="0"
                max="60"
              />
            </InputWrap>
          </div>

          <InputWrap
            icon={
              <GraduationCap
                size={16}
              />
            }
          >
            <FormInput
              label="Qualification"
              name="qualification"
              value={
                values.qualification
              }
              onChange={
                handleChange
              }
              error={
                errors.qualification
              }
              placeholder="MBBS, MD"
              required
            />
          </InputWrap>

          <button
            type="submit"
            disabled={saving}
            style={styles.btn}
          >
            <UserPlus size={16} />
            {saving
              ? 'Creating...'
              : 'Create Doctor'}
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
    background:
      '#f4f7fb',
    minHeight: '100vh',
    maxWidth: '900px',
  },

  backBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#1d4ed8,#2563eb)',
    color: '#fff',
    padding:
      '10px 16px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700',
    marginBottom:
      '20px',
  },

  hero: {
    background:
      'linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)',
    color: '#fff',
    borderRadius:
      '24px',
    padding: '28px',
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom:
      '22px',
  },

  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius:
      '18px',
    background:
      'rgba(255,255,255,.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom:
      '14px',
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
    borderRadius:
      '22px',
    padding: '26px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: '16px',
  },

  inputWrap: {
    position:
      'relative',
  },

  inputIcon: {
    position:
      'absolute',
    right: '14px',
    top: '42px',
    zIndex: 2,
    color: '#94a3b8',
  },

  btn: {
    width: '100%',
    marginTop: '16px',
    border: 'none',
    background:
      'linear-gradient(135deg,#16a34a,#22c55e)',
    color: '#fff',
    padding:
      '14px 18px',
    borderRadius:
      '14px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: '8px',
  },
};

export default AdminCreateDoctor;