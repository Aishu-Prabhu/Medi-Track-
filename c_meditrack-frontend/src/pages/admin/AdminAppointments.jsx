// src/pages/admin/AdminAppointments.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ArrowLeft,
  Filter,
  XCircle,
} from 'lucide-react';

import {
  getAllAppointments,
  cancelAppointment,
} from '../../api/appointmentService';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

function AdminAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [msg, setMsg] =
    useState('');

  const [filter, setFilter] =
    useState('ALL');

  useEffect(() => {
    getAllAppointments()
      .then((r) =>
        setAppointments(r.data)
      )
      .catch(() =>
        setError(
          'Failed to load appointments'
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  const handleCancel = async (
    id
  ) => {
    const ok = window.confirm(
      'Cancel this appointment?'
    );

    if (!ok) return;

    try {
      const res =
        await cancelAppointment(id);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? res.data
            : a
        )
      );

      setMsg(
        'Appointment cancelled'
      );
    } catch {
      setError(
        'Cancel failed'
      );
    }
  };

  if (loading) return <Spinner />;

  const STATUSES = [
    'ALL',
    'PENDING_PAYMENT',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
  ];

  const filtered =
    filter === 'ALL'
      ? appointments
      : appointments.filter(
          (a) =>
            a.status === filter
        );

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
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <CalendarDays size={24} />
          </div>

          <h1 style={styles.title}>
            Appointment Management
          </h1>

          <p style={styles.sub}>
            View, filter and manage
            all patient bookings
            across the MediTrack
            system.
          </p>
        </div>

        <div style={styles.heroCount}>
          {appointments.length}
          <span>
            Total Records
          </span>
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
        message={msg}
        onClose={() =>
          setMsg('')
        }
      />

      {/* FILTER */}
      <div style={styles.filterBar}>
        <div style={styles.filterTitle}>
          <Filter size={16} />
          Status Filter
        </div>

        <div style={styles.filterWrap}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() =>
                setFilter(s)
              }
              style={{
                ...styles.filterBtn,
                ...(filter === s
                  ? styles.activeFilter
                  : {}),
              }}
            >
              {s.replaceAll(
                '_',
                ' '
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={th}>
                #
              </th>
              <th style={th}>
                Patient
              </th>
              <th style={th}>
                Doctor
              </th>
              <th style={th}>
                Specialization
              </th>
              <th style={th}>
                Date
              </th>
              <th style={th}>
                Slot
              </th>
              <th style={th}>
                Status
              </th>
              <th style={th}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(
              (a) => (
                <tr
                  key={a.id}
                  style={
                    styles.row
                  }
                >
                  <td style={td}>
                    {a.id}
                  </td>

                  <td style={td}>
                    {
                      a.patientName
                    }
                  </td>

                  <td style={td}>
                    {
                      a.doctorName
                    }
                  </td>

                  <td style={td}>
                    {
                      a.specialization
                    }
                  </td>

                  <td style={td}>
                    {
                      a.appointmentDate
                    }
                  </td>

                  <td style={td}>
                    {a.slot}
                  </td>

                  <td style={td}>
                    <StatusBadge
                      status={
                        a.status
                      }
                    />
                  </td>

                  <td style={td}>
                    {(a.status ===
                      'PENDING_PAYMENT' ||
                      a.status ===
                        'CONFIRMED') && (
                      <button
                        onClick={() =>
                          handleCancel(
                            a.id
                          )
                        }
                        style={
                          styles.cancelBtn
                        }
                      >
                        <XCircle
                          size={
                            14
                          }
                        />
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              )
            )}

            {filtered.length ===
              0 && (
              <tr>
                <td
                  colSpan="8"
                  style={
                    styles.empty
                  }
                >
                  No appointments
                  found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}) {
  const colors = {
    PENDING_PAYMENT:
      '#f59e0b',
    CONFIRMED:
      '#16a34a',
    COMPLETED:
      '#1565C0',
    CANCELLED:
      '#dc2626',
  };

  return (
    <span
      style={{
        background:
          colors[status] ||
          '#64748b',
        color: '#fff',
        padding:
          '6px 12px',
        borderRadius:
          '999px',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing:
          '.3px',
      }}
    >
      {status.replaceAll(
        '_',
        ' '
      )}
    </span>
  );
}

const styles = {
  page: {
    padding: '28px',
    background: '#f4f7fb',
    minHeight: '100vh',
  },

  backBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#1e40af,#2563eb)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    boxShadow:
      '0 8px 18px rgba(37,99,235,0.18)',
  },

  hero: {
    background:
      'linear-gradient(135deg,#0f172a,#1e40af,#2563eb)',
    color: '#fff',
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    boxShadow:
      '0 18px 40px rgba(37,99,235,0.18)',
  },

  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '18px',
    background:
      'rgba(255,255,255,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px',
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },

  sub: {
    marginTop: '8px',
    fontSize: '14px',
    color:
      'rgba(255,255,255,0.86)',
    lineHeight: '1.6',
  },

  heroCount: {
    minWidth: '160px',
    height: '120px',
    borderRadius: '22px',
    background:
      'rgba(255,255,255,0.12)',
    border:
      '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
    fontWeight: '300',
    backdropFilter: 'blur(6px)',
  },

  filterBar: {
    background: '#fff',
    padding: '18px',
    borderRadius: '18px',
    marginBottom: '22px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,0.05)',
  },

  filterTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '14px',
    fontSize: '14px',
  },

  filterWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },

  filterBtn: {
    border: 'none',
    background: '#eff6ff',
    color: '#2563eb',
    padding: '10px 14px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    transition: '0.2s ease',
  },

  activeFilter: {
    background:
      'linear-gradient(135deg,#1e40af,#2563eb)',
    color: '#fff',
    boxShadow:
      '0 8px 16px rgba(37,99,235,0.18)',
  },

  tableCard: {
    background: '#fff',
    borderRadius: '22px',
    overflow: 'hidden',
    boxShadow:
      '0 12px 28px rgba(15,23,42,0.06)',
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },

  row: {
    transition: '0.2s ease',
  },

  cancelBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow:
      '0 8px 16px rgba(239,68,68,0.18)',
  },

  empty: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '600',
  },
};

const th = {
  textAlign: 'left',
  padding: '16px 18px',
  fontSize: '13px',
  fontWeight: '800',
  color: '#64748b',
  background: '#f8fafc',
};


const td = {
  padding: '16px 18px',
  fontSize: '13px',
  borderTop: '1px solid #f1f5f9',
  color: '#0f172a',
};

export default AdminAppointments;