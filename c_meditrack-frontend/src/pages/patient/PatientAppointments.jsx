// src/pages/patient/PatientAppointments.jsx
// FULL PROFESSIONAL UI ONLY
// LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Clock3,
  UserRound,
  Ban,
  ClipboardList,
  AlertTriangle,
  XCircle
} from 'lucide-react';

import {
  getAppointmentsByPatient,
  cancelAppointment
} from '../../api/appointmentService';

import { getMyProfile } from '../../api/patientService';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

const STATUS_COLOR = {
  PENDING_PAYMENT: {
    bg: '#fff7ed',
    text: '#f97316'
  },
  CONFIRMED: {
    bg: '#ecfdf5',
    text: '#16a34a'
  },
  COMPLETED: {
    bg: '#eff6ff',
    text: '#2563eb'
  },
  CANCELLED: {
    bg: '#fef2f2',
    text: '#dc2626'
  }
};

function PatientAppointments() {
  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [successMsg, setSuccessMsg] =
    useState('');

  const [cancelModal, setCancelModal] =
    useState(null);

  const [reason, setReason] =
    useState('');

  const [cancelling, setCancelling] =
    useState(false);

  const loadAppointments = async () => {
    try {
      const profileRes =
        await getMyProfile();

      const patientId =
        profileRes.data.id;

      const apptRes =
        await getAppointmentsByPatient(
          patientId
        );

      setAppointments(apptRes.data);
    } catch {
      setError(
        'Failed to load appointments.'
      );
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    loadAppointments();

    const timer = setInterval(() => {
      loadAppointments();
    }, 5000);

    return () =>
      clearInterval(timer);
  }, []);

  const openCancelModal = (
    appointment
  ) => {
    setReason('');
    setCancelModal(appointment);
  };

  const confirmCancel = async () => {
    if (!reason.trim()) {
      setError(
        'Please enter cancellation reason.'
      );
      return;
    }

    setCancelling(true);

    try {
      const res =
        await cancelAppointment(
          cancelModal.id,
          reason.trim()
        );

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelModal.id
            ? res.data
            : a
        )
      );

      setSuccessMsg(
        'Appointment cancelled successfully. Refund updates are available in Notifications and Payments.'
      );

      setCancelModal(null);
      setReason('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to cancel appointment.'
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner />;

  const total =
    appointments.length;

  const upcoming =
    appointments.filter(
      (a) =>
        a.status === 'CONFIRMED'
    ).length;

  const cancelled =
    appointments.filter(
      (a) =>
        a.status === 'CANCELLED'
    ).length;

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
        message={successMsg}
        onClose={() =>
          setSuccessMsg('')
        }
      />

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <ClipboardList size={24} />
          </div>

          <h1 style={styles.title}>
            My Appointments
          </h1>

          <p style={styles.subtitle}>
            Manage bookings,
            cancellations and
            consultation schedule.
          </p>
        </div>

        <div style={styles.heroCount}>
          <div
            style={styles.heroNumber}
          >
            {total}
          </div>

          <div
            style={styles.heroText}
          >
            Total Records
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        <StatCard
          label="Upcoming"
          value={upcoming}
          icon={
            <CalendarDays
              size={18}
            />
          }
        />

        <StatCard
          label="Cancelled"
          value={cancelled}
          icon={
            <Ban size={18} />
          }
        />

        <StatCard
          label="Completed"
          value={
            appointments.filter(
              (a) =>
                a.status ===
                'COMPLETED'
            ).length
          }
          icon={
            <ClipboardList
              size={18}
            />
          }
        />
      </div>

      {/* LIST */}
      {appointments.length ===
      0 ? (
        <div style={styles.empty}>
          No appointments found.
        </div>
      ) : (
        <div style={styles.listWrap}>
          {appointments.map(
            (a) => {
              const sc =
                STATUS_COLOR[
                  a.status
                ] || {
                  bg: '#f1f5f9',
                  text: '#334155'
                };

              return (
                <div
                  key={a.id}
                  style={
                    styles.card
                  }
                >
                  <div
                    style={
                      styles.left
                    }
                  >
                    <div
                      style={
                        styles.topLine
                      }
                    >
                      <span
                        style={
                          styles.idBadge
                        }
                      >
                        #{a.id}
                      </span>

                      <span
                        style={{
                          ...styles.status,
                          background:
                            sc.bg,
                          color:
                            sc.text
                        }}
                      >
                        {
                          a.status
                        }
                      </span>
                    </div>

                    <div
                      style={
                        styles.meta
                      }
                    >
                      <UserRound
                        size={
                          15
                        }
                      />
                      Dr.{' '}
                      {
                        a.doctorName
                      }
                    </div>

                    <div
                      style={
                        styles.meta
                      }
                    >
                      <CalendarDays
                        size={
                          15
                        }
                      />
                      {
                        a.appointmentDate
                      }
                    </div>

                    <div
                      style={
                        styles.meta
                      }
                    >
                      <Clock3
                        size={
                          15
                        }
                      />
                      {
                        a.slot
                      }
                    </div>

                    <div
                      style={
                        styles.speciality
                      }
                    >
                      {
                        a.specialization
                      }
                    </div>

                    {a.status ===
                      'CANCELLED' &&
                      a.cancelReason && (
                        <div
                          style={
                            styles.reason
                          }
                        >
                          <AlertTriangle
                            size={
                              14
                            }
                          />
                          {
                            a.cancelReason
                          }
                        </div>
                      )}
                  </div>

                  <div
                    style={
                      styles.right
                    }
                  >
                    {(a.status ===
                      'PENDING_PAYMENT' ||
                      a.status ===
                        'CONFIRMED') && (
                      <button
                        onClick={() =>
                          openCancelModal(
                            a
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
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* MODAL */}
      {cancelModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div
              style={
                styles.modalIcon
              }
            >
              <XCircle
                size={24}
              />
            </div>

            <h3
              style={
                styles.modalTitle
              }
            >
              Cancel Appointment
            </h3>

            <p
              style={
                styles.modalSub
              }
            >
              Dr.{' '}
              {
                cancelModal.doctorName
              }
              {' • '}
              {
                cancelModal.appointmentDate
              }
              {' • '}
              {
                cancelModal.slot
              }
            </p>

            {cancelModal.status ===
              'CONFIRMED' && (
              <div
                style={
                  styles.warning
                }
              >
                Paid appointment.
                Refund updates will
                appear in Payments
                and Notifications.
              </div>
            )}

            <label
              style={
                styles.label
              }
            >
              Cancellation
              Reason
            </label>

            <textarea
              rows="4"
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target
                    .value
                )
              }
              style={
                styles.textarea
              }
              placeholder="Enter reason..."
            />

            <div
              style={
                styles.btnRow
              }
            >
              <button
                onClick={() =>
                  setCancelModal(
                    null
                  )
                }
                style={
                  styles.keepBtn
                }
              >
                Keep
              </button>

              <button
                onClick={
                  confirmCancel
                }
                disabled={
                  cancelling
                }
                style={
                  styles.confirmBtn
                }
              >
                {cancelling
                  ? 'Cancelling...'
                  : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>
        <div
          style={
            styles.statValue
          }
        >
          {value}
        </div>

        <div
          style={
            styles.statLabel
          }
        >
          {label}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    background:
      '#f4f7fb',
    minHeight: '100vh'
  },

  hero: {
    background:
      'linear-gradient(135deg,#0f172a,#1e40af,#2563eb)',
    borderRadius: '24px',
    padding: '28px',
    color: '#fff',
    display: 'flex',
    justifyContent:
      'space-between',
    gap: '20px',
    marginBottom: '24px'
  },

  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background:
      'rgba(255,255,255,.14)',
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    marginBottom: '14px'
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800'
  },

  subtitle: {
    marginTop: '8px',
    fontSize: '14px',
    color:
      'rgba(255,255,255,.86)'
  },

  heroCount: {
    minWidth: '150px',
    borderRadius: '20px',
    background:
      'rgba(255,255,255,.12)',
    display: 'flex',
    flexDirection:
      'column',
    justifyContent:
      'center',
    alignItems:
      'center'
  },

  heroNumber: {
    fontSize: '28px',
    fontWeight: '800'
  },

  heroText: {
    fontSize: '12px'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(220px,1fr))',
    gap: '18px',
    marginBottom: '24px'
  },

  statCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '18px',
    display: 'flex',
    alignItems:
      'center',
    gap: '14px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,.05)'
  },

  statIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background:
      '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center'
  },

  statValue: {
    fontSize: '22px',
    fontWeight: '800'
  },

  statLabel: {
    fontSize: '13px',
    color: '#64748b'
  },

  listWrap: {
    display: 'flex',
    flexDirection:
      'column',
    gap: '16px'
  },

  card: {
    background: '#fff',
    borderRadius: '22px',
    padding: '22px',
    display: 'flex',
    justifyContent:
      'space-between',
    gap: '20px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)'
  },

  left: {
    flex: 1
  },

  right: {
    display: 'flex',
    alignItems:
      'center'
  },

  topLine: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '12px'
  },

  idBadge: {
    background:
      '#eff6ff',
    color: '#2563eb',
    padding:
      '8px 12px',
    borderRadius:
      '999px',
    fontWeight: '800',
    fontSize: '12px'
  },

  status: {
    padding:
      '8px 12px',
    borderRadius:
      '999px',
    fontWeight: '700',
    fontSize: '12px'
  },

  meta: {
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
    color: '#475569',
    fontSize: '14px',
    marginBottom: '8px'
  },

  speciality: {
    marginTop: '8px',
    display:
      'inline-block',
    padding:
      '7px 12px',
    borderRadius:
      '999px',
    background:
      '#f8fafc',
    color: '#334155',
    fontSize: '12px',
    fontWeight: '700'
  },

  reason: {
    marginTop: '12px',
    display: 'flex',
    gap: '8px',
    color: '#dc2626',
    fontSize: '13px',
    fontWeight: '600'
  },

  cancelBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    padding:
      '10px 14px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'flex',
    alignItems:
      'center',
    gap: '8px'
  },

  empty: {
    background: '#fff',
    borderRadius: '22px',
    padding: '40px',
    textAlign:
      'center',
    color: '#64748b'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background:
      'rgba(15,23,42,.55)',
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    zIndex: 9999
  },

  modal: {
    background: '#fff',
    width: '100%',
    maxWidth: '480px',
    borderRadius: '22px',
    padding: '28px'
  },

  modalIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background:
      '#fef2f2',
    color: '#dc2626',
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
    marginBottom: '14px'
  },

  modalTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '800'
  },

  modalSub: {
    marginTop: '8px',
    color: '#64748b',
    fontSize: '14px'
  },

  warning: {
    marginTop: '16px',
    background:
      '#fff7ed',
    color: '#ea580c',
    padding: '12px',
    borderRadius: '14px',
    fontSize: '13px'
  },

  label: {
    display: 'block',
    marginTop: '18px',
    marginBottom: '8px',
    fontWeight: '700',
    fontSize: '14px'
  },

  textarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    border:
      '1px solid #cbd5e1',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing:
      'border-box'
  },

  btnRow: {
    display: 'flex',
    justifyContent:
      'flex-end',
    gap: '12px',
    marginTop: '18px'
  },

  keepBtn: {
    border: 'none',
    background:
      '#f1f5f9',
    color: '#0f172a',
    padding:
      '10px 18px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700'
  },

  confirmBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    padding:
      '10px 18px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700'
  }
};

export default PatientAppointments;