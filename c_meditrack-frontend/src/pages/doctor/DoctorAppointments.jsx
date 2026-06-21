// src/pages/doctor/DoctorAppointments.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  ClipboardList,
  FileClock,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getAllDoctors } from '../../api/doctorService';
import {
  getAppointmentsByDoctor,
  cancelAppointment,
  completeAppointment,
} from '../../api/appointmentService';

import Spinner from '../../components/common/Spinner';
import { getPatientById }
from '../../api/patientService';
import Alert from '../../components/common/Alert';

function DoctorAppointments() {
  const { user } = useAuth();

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [msg, setMsg] =
    useState('');

  const [patientHistory,
  setPatientHistory] =
    useState(null);

  const [showHistory,
  setShowHistory] =
    useState(false);





  useEffect(() => {
    async function load() {
      try {
        const allDocs =
          await getAllDoctors();

        const myDoc =
          allDocs.data.find(
            (d) =>
              d.email ===
              user?.email
          );

        if (myDoc) {
          const res =
            await getAppointmentsByDoctor(
              myDoc.id
            );

          setAppointments(
            res.data
          );
        }
      } catch {
        setError(
          'Failed to load appointments'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const handleHistory =
  async (patientId) => {

    try {

      const res =
        await getPatientById(
          patientId
        );

      setPatientHistory(
        res.data
      );

      setShowHistory(
        true
      );

    } catch {

      setError(
        'Failed to load patient history'
      );
    }
  };

  const handleComplete =
    async (id) => {
      try {
        const res =
          await completeAppointment(
            id
          );

        setAppointments(
          (prev) =>
            prev.map((a) =>
              a.id === id
                ? res.data
                : a
            )
        );

        setMsg(
          'Appointment marked as completed'
        );
      } catch {
        setError(
          'Failed to complete appointment'
        );
      }
    };

  const handleCancel =
    async (id) => {
      const {
        value: reason,
      } =
        await Swal.fire({
          title:
            'Cancel Appointment',
          text: 'Select cancellation reason',
          input: 'select',
          inputOptions: {
            'Doctor unavailable':
              'Doctor unavailable',
            'Emergency leave':
              'Emergency leave',
            'Patient requested':
              'Patient requested',
            Rescheduled:
              'Rescheduled',
          },
          inputPlaceholder:
            'Choose reason',
          showCancelButton:
            true,
          confirmButtonText:
            'Cancel Appointment',
          confirmButtonColor:
            '#dc2626',
          cancelButtonText:
            'Close',
        });

      if (!reason) return;

      try {
        const res =
          await cancelAppointment(
            id,
            reason
          );

        setAppointments(
          (prev) =>
            prev.map((a) =>
              a.id === id
                ? res.data
                : a
            )
        );

        Swal.fire({
          icon: 'success',
          title:
            'Cancelled',
          text: 'Appointment cancelled successfully',
        });

        setMsg(
          'Appointment cancelled'
        );
      } catch {
        Swal.fire({
          icon: 'error',
          title:
            'Failed',
          text: 'Unable to cancel appointment',
        });

        setError(
          'Cancellation failed'
        );
      }
    };

  if (loading) return <Spinner />;

  const confirmed =
    appointments.filter(
      (a) =>
        a.status ===
        'CONFIRMED'
    ).length;

  const completed =
    appointments.filter(
      (a) =>
        a.status ===
        'COMPLETED'
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
        message={msg}
        onClose={() =>
          setMsg('')
        }
      />

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <CalendarDays size={26} />
          </div>

          <h1 style={styles.title}>
            My Appointments
          </h1>

          <p style={styles.subtitle}>
            View patient bookings,
            complete visits and
            manage your schedule
            efficiently.
          </p>
        </div>

        <div style={styles.countCard}>
          <div
            style={
              styles.countNumber
            }
          >
            {
              appointments.length
            }
          </div>

          <div
            style={
              styles.countText
            }
          >
            Total Records
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsWrap}>
        <StatCard
          icon={
            <ClipboardList
              size={18}
            />
          }
          label="Total"
          value={
            appointments.length
          }
        />

        <StatCard
          icon={
            <CheckCircle2
              size={18}
            />
          }
          label="Confirmed"
          value={confirmed}
        />

        <StatCard
          icon={
            <Clock3
              size={18}
            />
          }
          label="Completed"
          value={completed}
        />
      </div>

      {/* TABLE */}
      {appointments.length ===
      0 ? (
        <div
          style={
            styles.emptyCard
          }
        >
          No appointments
          yet.
        </div>
      ) : (
        <div
          style={
            styles.tableWrap
          }
        >
          <table
            style={
              styles.table
            }
          >
            <thead>
              <tr>
                <th style={th}>
                  #
                </th>
                <th style={th}>
                  Patient
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
              {appointments.map(
                (a) => (
                  <tr
                    key={
                      a.id
                    }
                  >
                    <td style={td}>
                      {a.id}
                    </td>

                    <td style={td}>
                      <div
                        style={
                          styles.userWrap
                        }
                      >
                        <UserRound
                          size={
                            15
                          }
                        />
                        {
                          a.patientName
                        }
                      </div>
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
                      <div
                        style={
                          styles.actionWrap
                        }
                      >
                      <button
  onClick={() =>
    handleHistory(
      a.patientId
    )
  }
  style={
    styles.historyBtn
  }
>
  <FileClock
    size={14}
  />
  History
</button>  
                        

                        {(a.status ===
                          'CONFIRMED' ||
                          a.status ===
                            'PENDING_PAYMENT') && (
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
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
            

      {showHistory &&
        patientHistory && (
          <div
            style={
              styles.modalOverlay
            }
          >
            <div
              style={
                styles.historyModal
              }
            >
              <div
                style={
                  styles.modalTop
                }
              >
                <h2>
                  Patient History
                </h2>

                <button
                  onClick={() =>
                    setShowHistory(
                      false
                    )
                  }
                  style={
                    styles.closeBtn
                  }
                >
                  ✕
                </button>
              </div>

              <div
                style={
                  styles.historyGrid
                }
              >
                <div>
                  <strong>
                    Name:
                  </strong>{' '}
                  {
                    patientHistory.name
                  }
                </div>

                <div>
                  <strong>
                    Age:
                  </strong>{' '}
                  {
                    patientHistory.age
                  }
                </div>

                <div>
                  <strong>
                    Blood Group:
                  </strong>{' '}
                  {
                    patientHistory.bloodGroup
                  }
                </div>

                <div>
                  <strong>
                    Phone:
                  </strong>{' '}
                  {
                    patientHistory.phone
                  }
                </div>
              </div>

              <div
                style={{
                  marginTop:
                    '24px',
                }}
              >
                <h3>
                  Medical History
                </h3>

                <div
                  style={
                    styles.historyBox
                  }
                >
                  {patientHistory.medicalHistory ||
                    'No medical history available'}
                </div>
              </div>
            </div>
          </div>
      )}

    </div>
  );
}
   

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div style={styles.statCard}>
      <div
        style={
          styles.statIcon
        }
      >
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

function StatusBadge({
  status,
}) {
  const colors = {
    PENDING_PAYMENT:
      '#f59e0b',
    CONFIRMED:
      '#16a34a',
    COMPLETED:
      '#2563eb',
    CANCELLED:
      '#dc2626',
  };

  return (
    <span
      style={{
        background:
          colors[
            status
          ] ||
          '#64748b',
        color: '#fff',
        padding:
          '7px 12px',
        borderRadius:
          '999px',
        fontSize:
          '11px',
        fontWeight:
          '800',
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
    background:
      '#f4f7fb',
    minHeight: '100vh',
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
      'rgba(255,255,255,0.14)',
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
    color:
      'rgba(255,255,255,0.86)',
    maxWidth: '600px',
    lineHeight: '1.6',
    fontSize: '14px',
  },

  countCard: {
    minWidth: '125px',
    height: '92px',
    borderRadius:
      '18px',
    background:
      'rgba(255,255,255,0.12)',
    border:
      '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    flexDirection:
      'column',
    alignItems:
      'center',
    justifyContent:
      'center',
    padding: '10px',
  },

  countNumber: {
    fontSize: '26px',
    fontWeight: '800',
  },

  countText: {
    fontSize: '11px',
    fontWeight: '600',
    opacity: 0.9,
  },

  statsWrap: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(220px,1fr))',
    gap: '18px',
    marginBottom:
      '24px',
  },

  statCard: {
    background: '#fff',
    borderRadius:
      '18px',
    padding: '18px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,0.05)',
    display: 'flex',
    alignItems:
      'center',
    gap: '14px',
  },

  statIcon: {
    width: '42px',
    height: '42px',
    borderRadius:
      '12px',
    background:
      '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems:
      'center',
    justifyContent:
      'center',
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
  },

  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },

  tableWrap: {
    background: '#fff',
    borderRadius:
      '22px',
    overflow: 'hidden',
    boxShadow:
      '0 12px 28px rgba(15,23,42,0.06)',
  },

  table: {
    width: '100%',
    borderCollapse:
      'collapse',
  },

  userWrap: {
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
    fontWeight: '700',
  },

  actionWrap: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  completeBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#16a34a,#22c55e)',
    color: '#fff',
    padding:
      '8px 12px',
    borderRadius:
      '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems:
      'center',
    gap: '6px',
  },

  cancelBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    padding:
      '8px 12px',
    borderRadius:
      '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems:
      'center',
    gap: '6px',
  },
  historyBtn: {
  border: 'none',

  background:
    'linear-gradient(135deg,#2563eb,#1d4ed8)',

  color: '#fff',

  padding: '8px 12px',

  borderRadius: '10px',

  cursor: 'pointer',

  fontSize: '12px',

  fontWeight: '700',

  display: 'flex',

  alignItems: 'center',

  gap: '6px',
},

modalOverlay: {
  position: 'fixed',

  top: 0,

  left: 0,

  right: 0,

  bottom: 0,

  background:
    'rgba(15,23,42,0.55)',

  display: 'flex',

  justifyContent: 'center',

  alignItems: 'center',

  zIndex: 999,
},

historyModal: {
  background: '#fff',

  width: '650px',

  maxWidth: '95%',

  borderRadius: '24px',

  padding: '28px',

  boxShadow:
    '0 20px 50px rgba(0,0,0,0.25)',
},

modalTop: {
  display: 'flex',

  justifyContent:
    'space-between',

  alignItems: 'center',

  marginBottom: '20px',
},

closeBtn: {
  border: 'none',

  background: '#f1f5f9',

  width: '36px',

  height: '36px',

  borderRadius: '50%',

  cursor: 'pointer',

  fontWeight: '700',

  fontSize: '16px',
},

historyGrid: {
  display: 'grid',

  gridTemplateColumns:
    '1fr 1fr',

  gap: '16px',

  marginBottom: '20px',
},

historyBox: {
  background: '#f8fafc',

  padding: '18px',

  borderRadius: '16px',

  lineHeight: '1.7',

  color: '#334155',

  border:
    '1px solid #e2e8f0',
},

  emptyCard: {
    background: '#fff',
    padding: '24px',
    borderRadius:
      '18px',
    color: '#64748b',
    boxShadow:
      '0 10px 24px rgba(15,23,42,0.05)',
  },
};

const th = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: '700',
  color: '#64748b',
  background: '#f8fafc',
};

const td = {
  padding: '16px',
  fontSize: '13px',
  borderTop:
    '1px solid #f1f5f9',
};

export default DoctorAppointments;