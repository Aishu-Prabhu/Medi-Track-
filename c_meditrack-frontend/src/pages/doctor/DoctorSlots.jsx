// src/pages/doctor/DoctorSlots.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import {
  Clock3,
  CalendarDays,
  Zap,
  Search,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getAllDoctors } from '../../api/doctorService';
import {
  generateSlots,
  getAllSlots,
} from '../../api/appointmentService';

import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

function DoctorSlots() {
  const { user } = useAuth();

  const [doctorId, setDoctorId] =
    useState(null);

  const [selectedDate, setSelectedDate] =
    useState('');

  const [slots, setSlots] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [initLoading, setInitLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  useEffect(() => {
    getAllDoctors()
      .then((res) => {
        const myDoc =
          res.data.find(
            (d) =>
              d.email ===
              user?.email
          );

        if (myDoc)
          setDoctorId(
            myDoc.id
          );
      })
      .catch(() =>
        setError(
          'Failed to identify doctor'
        )
      )
      .finally(() =>
        setInitLoading(false)
      );
  }, [user]);

  const loadSlots =
    async () => {
      if (
        !doctorId ||
        !selectedDate
      )
        return;

      setLoading(true);

      try {
        const res =
          await getAllSlots(
            doctorId,
            selectedDate
          );

        setSlots(
          res.data
        );
      } catch {
        setError(
          'Failed to fetch slots'
        );
      } finally {
        setLoading(false);
      }
    };

  const handleGenerate =
    async () => {
      if (!selectedDate) {
        setError(
          'Please select a date'
        );
        return;
      }

      setLoading(true);
      setError('');

      try {
        await generateSlots(
          doctorId,
          selectedDate
        );

        setSuccess(
          'Slots generated successfully!'
        );

        await loadSlots();
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            'Failed to generate slots'
        );
      } finally {
        setLoading(false);
      }
    };

  if (initLoading)
    return <Spinner />;

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  return (
    <div style={styles.page}>
      <Alert
        type="error"
        message={error}
        onClose={() =>
          setError('')
        }
      />

      <Alert
        type="success"
        message={success}
        onClose={() =>
          setSuccess('')
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
            <Clock3
              size={24}
            />
          </div>

          <h1
            style={
              styles.title
            }
          >
            Manage Slots
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Generate daily
            appointment slots
            and monitor booking
            availability.
          </p>
        </div>

        <div
          style={
            styles.countCard
          }
        >
          <div
            style={
              styles.countNumber
            }
          >
            {slots.length}
          </div>

          <div
            style={
              styles.countText
            }
          >
            Loaded Slots
          </div>
        </div>
      </div>

      {/* FORM */}
      <div style={styles.card}>
        <div
          style={
            styles.sectionHead
          }
        >
          <CalendarDays
            size={18}
          />
          Select Date
        </div>

        <input
          type="date"
          value={
            selectedDate
          }
          min={today}
          onChange={(e) => {
            setSelectedDate(
              e.target.value
            );
            setSlots([]);
          }}
          style={
            styles.input
          }
        />

        <div
          style={
            styles.btnRow
          }
        >
          <button
            onClick={
              handleGenerate
            }
            disabled={
              loading ||
              !selectedDate
            }
            style={
              styles.primaryBtn
            }
          >
            <Zap
              size={16}
            />
            Generate Slots
          </button>

          <button
            onClick={
              loadSlots
            }
            disabled={
              loading ||
              !selectedDate
            }
            style={
              styles.secondaryBtn
            }
          >
            <Search
              size={16}
            />
            View Slots
          </button>
        </div>
      </div>

      {loading && (
        <Spinner />
      )}

      {/* SLOT LIST */}
      {slots.length >
        0 && (
        <div
          style={
            styles.card
          }
        >
          <div
            style={
              styles.sectionHead
            }
          >
            <Clock3
              size={18}
            />
            Slots for{' '}
            {
              selectedDate
            }
          </div>

          <div
            style={
              styles.slotGrid
            }
          >
            {slots.map(
              (s) => (
                <div
                  key={
                    s.id
                  }
                  style={{
                    ...styles.slotPill,
                    ...(s.status ===
                    'AVAILABLE'
                      ? styles.available
                      : styles.booked),
                  }}
                >
                  {
                    s.slotTime
                  }

                  <span>
                    {
                      s.status
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    background:
      '#f4f7fb',
    minHeight: '100vh',
    maxWidth: '920px',
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
    lineHeight: '1.6',
    color:
      'rgba(255,255,255,.86)',
  },

  countCard: {
    minWidth: '125px',
    height: '92px',
    borderRadius:
      '18px',
    background:
      'rgba(255,255,255,.12)',
    display: 'flex',
    flexDirection:
      'column',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  countNumber: {
    fontSize: '26px',
    fontWeight: '800',
  },

  countText: {
    fontSize: '11px',
    opacity: 0.9,
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
      '16px',
  },

  input: {
    width: '100%',
    padding:
      '13px 14px',
    border:
      '1px solid #dbeafe',
    borderRadius:
      '14px',
    background:
      '#f8fbff',
    fontSize: '14px',
    outline: 'none',
    boxSizing:
      'border-box',
    marginBottom:
      '16px',
  },

  btnRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },

  primaryBtn: {
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

  secondaryBtn: {
    border: 'none',
    background:
      '#eff6ff',
    color: '#2563eb',
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

  slotGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(180px,1fr))',
    gap: '12px',
  },

  slotPill: {
    padding: '14px',
    borderRadius:
      '16px',
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    flexDirection:
      'column',
    gap: '6px',
  },

  available: {
    background:
      '#ecfdf5',
    color: '#16a34a',
    border:
      '1px solid #bbf7d0',
  },

  booked: {
    background:
      '#fef2f2',
    color: '#dc2626',
    border:
      '1px solid #fecaca',
  },
};

export default DoctorSlots;