// src/pages/admin/AdminSlots.jsx
// UI UPGRADE ONLY - LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Clock3,
  Search,
  Sparkles,
  UserRound,
  CheckCircle2,
  XCircle,
  Layers3,
  Info,
} from 'lucide-react';

import { getAllDoctors } from '../../api/doctorService';
import {
  generateSlots,
  getAllSlots,
} from '../../api/appointmentService';

import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

function AdminSlots() {
  const navigate = useNavigate();

  const [doctors, setDoctors] =
    useState([]);

  const [selectedDoctor, setSelectedDoctor] =
    useState('');

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
      .then((r) =>
        setDoctors(r.data)
      )
      .catch(() =>
        setError(
          'Failed to load doctors'
        )
      )
      .finally(() =>
        setInitLoading(false)
      );
  }, []);

  const loadSlots = async () => {
    if (
      !selectedDoctor ||
      !selectedDate
    ) {
      setError(
        'Select doctor and date'
      );
      return;
    }

    setLoading(true);
    setSlots([]);
    setError('');

    try {
      const res =
        await getAllSlots(
          selectedDoctor,
          selectedDate
        );

      setSlots(res.data);

      if (
        res.data.length === 0
      ) {
        setError(
          'No slots found. Generate first.'
        );
      }
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
      if (
        !selectedDoctor ||
        !selectedDate
      ) {
        setError(
          'Select doctor and date'
        );
        return;
      }

      setLoading(true);
      setError('');

      try {
        await generateSlots(
          selectedDoctor,
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

  const available =
    slots.filter(
      (s) =>
        s.status ===
        'AVAILABLE'
    ).length;

  const booked =
    slots.filter(
      (s) =>
        s.status ===
        'BOOKED'
    ).length;

  const doctorName =
    doctors.find(
      (d) =>
        String(d.id) ===
        String(
          selectedDoctor
        )
    )?.name || '-';

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
            <Clock3 size={26} />
          </div>

          <h1 style={styles.title}>
            Slot Management
          </h1>

          <p style={styles.subtitle}>
            Generate, review and
            manage doctor
            appointment slots for
            efficient scheduling.
          </p>
        </div>

        <div style={styles.heroMini}>
          <div style={styles.heroStat}>
            <span
              style={
                styles.heroNum
              }
            >
              {
                doctors.length
              }
            </span>
            <span
              style={
                styles.heroTxt
              }
            >
              Doctors
            </span>
          </div>
        </div>
      </div>

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

      {/* FORM CARD */}
      <div style={styles.card}>
        <div style={styles.grid}>
          <div>
            <label
              style={
                styles.label
              }
            >
              Doctor
            </label>

            <div
              style={
                styles.inputWrap
              }
            >
              <UserRound
                size={16}
              />

              <select
                value={
                  selectedDoctor
                }
                onChange={(
                  e
                ) => {
                  setSelectedDoctor(
                    e.target
                      .value
                  );
                  setSlots(
                    []
                  );
                }}
                style={
                  styles.select
                }
              >
                <option value="">
                  Select
                  Doctor
                </option>

                {doctors.map(
                  (d) => (
                    <option
                      key={
                        d.id
                      }
                      value={
                        d.id
                      }
                    >
                      Dr.{' '}
                      {
                        d.name
                      }{' '}
                      (
                      {
                        d.specialization
                      }
                      )
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div>
            <label
              style={
                styles.label
              }
            >
              Date
            </label>

            <div
              style={
                styles.inputWrap
              }
            >
              <CalendarDays
                size={16}
              />

              <input
                type="date"
                min={today}
                value={
                  selectedDate
                }
                onChange={(
                  e
                ) => {
                  setSelectedDate(
                    e.target
                      .value
                  );
                  setSlots(
                    []
                  );
                }}
                style={
                  styles.input
                }
              />
            </div>
          </div>
        </div>

        <div style={styles.btnWrap}>
          <button
            onClick={
              handleGenerate
            }
            disabled={
              loading
            }
            style={
              styles.greenBtn
            }
          >
            <Sparkles
              size={16}
            />
            Generate Slots
          </button>

          <button
            onClick={
              loadSlots
            }
            disabled={
              loading
            }
            style={
              styles.blueBtn
            }
          >
            <Search
              size={16}
            />
            View Slots
          </button>
        </div>
      </div>

      {loading && <Spinner />}

      {/* SLOT DATA */}
      {slots.length > 0 && (
        <div
          style={
            styles.resultCard
          }
        >
          {/* STATS */}
          <div
            style={
              styles.statRow
            }
          >
            <StatPill
              icon={
                <Layers3
                  size={
                    14
                  }
                />
              }
              label="Total"
              value={
                slots.length
              }
              bg="#2563eb"
            />

            <StatPill
              icon={
                <CheckCircle2
                  size={
                    14
                  }
                />
              }
              label="Available"
              value={
                available
              }
              bg="#16a34a"
            />

            <StatPill
              icon={
                <XCircle
                  size={
                    14
                  }
                />
              }
              label="Booked"
              value={
                booked
              }
              bg="#dc2626"
            />
          </div>

          <h3
            style={
              styles.slotTitle
            }
          >
            Dr. {doctorName} —{' '}
            {
              selectedDate
            }
          </h3>

          <div
            style={
              styles.slotWrap
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
                  <Clock3
                    size={14}
                  />
                  {
                    s.slotTime
                  }
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* INFO */}
      <div style={styles.infoBox}>
        <Info size={16} />
        Default generated
        slots:
        09:00 AM, 10:00
        AM, 11:00 AM,
        02:00 PM, 03:00
        PM, 04:00 PM
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  bg,
}) {
  return (
    <div
      style={{
        ...styles.statPill,
        background: bg,
      }}
    >
      {icon}
      <strong>
        {value}
      </strong>
      {label}
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    background:
      '#f4f7fb',
    minHeight: '100vh',
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
    display: 'flex',
    gap: '14px',
  },

  heroStat: {
    background:
      'rgba(255,255,255,.12)',
    padding: '18px',
    borderRadius:
      '18px',
    minWidth: '130px',
    textAlign:
      'center',
  },

  heroNum: {
    display: 'block',
    fontSize: '30px',
    fontWeight: '800',
  },

  heroTxt: {
    fontSize: '13px',
  },

  card: {
    background: '#fff',
    borderRadius:
      '22px',
    padding: '24px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
    marginBottom:
      '22px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: '18px',
  },

  label: {
    display: 'block',
    marginBottom:
      '8px',
    fontWeight: '700',
    fontSize: '14px',
    color: '#0f172a',
  },

  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border:
      '1px solid #dbeafe',
    borderRadius:
      '14px',
    padding:
      '0 14px',
    height: '48px',
    background:
      '#f8fbff',
    color: '#64748b',
  },

  input: {
    border: 'none',
    outline: 'none',
    background:
      'transparent',
    width: '100%',
    fontSize: '14px',
  },

  select: {
    border: 'none',
    outline: 'none',
    background:
      'transparent',
    width: '100%',
    fontSize: '14px',
  },

  btnWrap: {
    display: 'flex',
    gap: '12px',
    marginTop:
      '18px',
    flexWrap: 'wrap',
  },

  greenBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#16a34a,#22c55e)',
    color: '#fff',
    padding:
      '12px 18px',
    borderRadius:
      '14px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  blueBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#fff',
    padding:
      '12px 18px',
    borderRadius:
      '14px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  resultCard: {
    background: '#fff',
    borderRadius:
      '22px',
    padding: '24px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
  },

  statRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom:
      '18px',
  },

  statPill: {
    color: '#fff',
    padding:
      '10px 14px',
    borderRadius:
      '14px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  slotTitle: {
    margin: 0,
    marginBottom:
      '16px',
    fontSize: '18px',
    color: '#0f172a',
  },

  slotWrap: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },

  slotPill: {
    padding:
      '12px 16px',
    borderRadius:
      '16px',
    fontSize: '13px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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

  infoBox: {
    marginTop: '22px',
    background: '#fff',
    borderRadius:
      '18px',
    padding: '16px',
    color: '#475569',
    fontSize: '13px',
    display: 'flex',
    gap: '10px',
    alignItems:
      'center',
    boxShadow:
      '0 10px 24px rgba(15,23,42,.05)',
  },
};

export default AdminSlots;