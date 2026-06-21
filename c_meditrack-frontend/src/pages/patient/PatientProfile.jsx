// src/pages/patient/PatientProfile.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import {
  UserRound,
  ShieldPlus,
  Save,
  FileText,
  Mail,
} from 'lucide-react';

import {
  getMyProfile,
  updatePatient,
  updateMedicalHistory,
} from '../../api/patientService';

import { useForm } from '../../hooks/useForm';
import {
  phone,
  bloodGroup,
  required,
} from '../../utils/validators';

import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

const BLOOD_GROUPS = [
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
];

function PatientProfile() {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [success, setSuccess] =
    useState('');

  const [error, setError] =
    useState('');

  const [historyInput, setHistoryInput] =
    useState('');

  const [historyMsg, setHistoryMsg] =
    useState('');

  const {
    values,
    errors,
    handleChange,
    validate,
    setValues,
  } = useForm(
    {
      name: '',
      phone: '',
      age: '',
      bloodGroup: '',
      address: '',
    },
    {
      phone,
      bloodGroup,
      age: (v) =>
        !v ||
        Number(v) < 1 ||
        Number(v) > 120
          ? 'Age must be between 1 and 120'
          : '',
      address:
        required(
          'Address'
        ),
    }
  );

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setProfile(
          res.data
        );

        setValues({
          name: res.data.name,
          phone:
            res.data.phone,
          age: String(
            res.data.age
          ),
          bloodGroup:
            res.data.bloodGroup,
          address:
            res.data.address,
        });

        setHistoryInput(
          res.data
            .medicalHistory ||
            ''
        );
      })
      .catch(() =>
        setError(
          'Failed to load profile'
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  const handleUpdate =
    async (e) => {
      e.preventDefault();

      if (!validate())
        return;

      setSaving(true);
      setError('');

      try {
        await updatePatient(
          profile.id,
          {
            ...profile,
            name:
              values.name,
            phone:
              values.phone,
            age: Number(
              values.age
            ),
            bloodGroup:
              values.bloodGroup,
            address:
              values.address,
          }
        );

        setSuccess(
          'Profile updated successfully!'
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            'Update failed'
        );
      } finally {
        setSaving(false);
      }
    };

  const handleHistoryUpdate =
    async () => {
      try {
        await updateMedicalHistory(
          profile.id,
          historyInput
        );

        setHistoryMsg(
          'Medical history updated!'
        );
      } catch {
        setHistoryMsg(
          'Failed to update history'
        );
      }
    };

  if (loading)
    return <Spinner />;

  return (
    <div style={styles.page}>
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

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <div
            style={
              styles.heroIcon
            }
          >
            <UserRound
              size={24}
            />
          </div>

          <h1
            style={
              styles.title
            }
          >
            My Profile
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Manage personal
            information and
            health records.
          </p>
        </div>

        <div
          style={
            styles.emailCard
          }
        >
          <Mail
            size={16}
          />
          <span>
            {
              profile?.email
            }
          </span>
        </div>
      </div>

      {/* PROFILE FORM */}
      <div style={styles.card}>
        <div
          style={
            styles.sectionHead
          }
        >
          <ShieldPlus
            size={18}
          />
          Personal Details
        </div>

        <form
          onSubmit={
            handleUpdate
          }
          noValidate
        >
          <div
            style={
              styles.grid
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
              required
            />

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
              required
            />

            <FormInput
              label="Age"
              name="age"
              type="number"
              value={
                values.age
              }
              onChange={
                handleChange
              }
              error={
                errors.age
              }
              required
            />

            <FormInput
              label="Blood Group"
              name="bloodGroup"
              value={
                values.bloodGroup
              }
              onChange={
                handleChange
              }
              error={
                errors.bloodGroup
              }
              options={
                BLOOD_GROUPS
              }
              required
            />
          </div>

          <FormInput
            label="Address"
            name="address"
            value={
              values.address
            }
            onChange={
              handleChange
            }
            error={
              errors.address
            }
            required
          />

          <button
            type="submit"
            disabled={
              saving
            }
            style={
              styles.primaryBtn
            }
          >
            <Save
              size={16}
            />
            {saving
              ? 'Saving...'
              : 'Update Profile'}
          </button>
        </form>
      </div>

      {/* HISTORY */}
      <div style={styles.card}>
        <div
          style={
            styles.sectionHead
          }
        >
          <FileText
            size={18}
          />
          Medical History
        </div>

        <textarea
  value={
    historyInput
  }
  onChange={(
    e
  ) =>
    setHistoryInput(
      e.target.value
    )
  }
  rows={5}
  placeholder="Example:
• Diabetes since 2020
• Hypertension / BP issues
• Asthma or breathing problems
• Previous surgeries or hospitalizations
• Current medications
• Allergies to medicines or food
• Thyroid problems
• Heart conditions
• Smoking or alcohol history
• Any chronic illness or ongoing treatment
"
  style={
    styles.textarea
  }
/>

        {historyMsg && (
          <div
            style={{
              marginTop:
                '10px',
              fontSize:
                '13px',
              fontWeight:
                '600',
              color:
                historyMsg.includes(
                  'Failed'
                )
                  ? '#dc2626'
                  : '#16a34a',
            }}
          >
            {
              historyMsg
            }
          </div>
        )}

        <button
          onClick={
            handleHistoryUpdate
          }
          style={{
            ...styles.primaryBtn,
            marginTop:
              '14px',
          }}
        >
          <Save
            size={16}
          />
          Update History
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    background:
      '#f4f7fb',
    minHeight: '100vh',
    maxWidth: '980px',
  },

  hero: {
    background:
      'linear-gradient(135deg,#0f172a,#1e40af,#2563eb)',
    borderRadius:
      '24px',
    padding: '28px',
    color: '#fff',
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    gap: '20px',
    marginBottom:
      '24px',
    boxShadow:
      '0 18px 40px rgba(37,99,235,0.18)',
  },

  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius:
      '16px',
    background:
      'rgba(255,255,255,.14)',
    display: 'flex',
    alignItems:
      'center',
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
    color:
      'rgba(255,255,255,.86)',
  },

  emailCard: {
    background:
      'rgba(255,255,255,.12)',
    padding:
      '14px 18px',
    borderRadius:
      '14px',
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
  },

  card: {
    background: '#fff',
    padding: '24px',
    borderRadius:
      '22px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
    marginBottom:
      '22px',
  },

  sectionHead: {
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom:
      '18px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: '16px',
  },

  primaryBtn: {
    marginTop: '8px',
    border: 'none',
    background:
      'linear-gradient(135deg,#1e40af,#2563eb)',
    color: '#fff',
    padding:
      '12px 18px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
  },

  textarea: {
    width: '100%',
    padding:
      '14px',
    border:
      '1px solid #dbeafe',
    borderRadius:
      '14px',
    background:
      '#f8fbff',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    boxSizing:
      'border-box',
  },
};

export default PatientProfile;