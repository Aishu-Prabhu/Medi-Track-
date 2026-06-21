// src/pages/patient/PatientDashboard.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserRound,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  FileText,
  PlusCircle,
  Settings,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getMyProfile } from '../../api/patientService';
import { getAppointmentsByPatient } from '../../api/appointmentService';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

function PatientDashboard() {
  const { user } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function load() {
      try {
        const profRes =
          await getMyProfile();

        setProfile(
          profRes.data
        );

        const apptRes =
          await getAppointmentsByPatient(
            profRes.data.id
          );

        setAppointments(
          apptRes.data
        );
      } catch {
        setError(
          'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return <Spinner />;

  const pending =
    appointments.filter(
      (a) =>
        a.status ===
        'PENDING_PAYMENT'
    ).length;

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
            Welcome Back,
            {' '}
            {profile?.name ||
              user?.email}
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            {profile?.email}
            {' • '}
            Blood Group:{' '}
            {
              profile?.bloodGroup
            }
            {' • '}
            Age:{' '}
            {profile?.age}
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
            {
              appointments.length
            }
          </div>
          <div
            style={
              styles.countText
            }
          >
            Total Visits
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsWrap}>
        <StatCard
          icon={
            <CalendarDays
              size={18}
            />
          }
          label="Appointments"
          value={
            appointments.length
          }
          to="/patient/appointments"
        />

        <StatCard
          icon={
            <CreditCard
              size={18}
            />
          }
          label="Pending Payment"
          value={pending}
          to="/patient/appointments"
        />

        <StatCard
          icon={
            <CheckCircle2
              size={18}
            />
          }
          label="Confirmed"
          value={confirmed}
          to="/patient/appointments"
        />

        <StatCard
          icon={
            <FileText
              size={18}
            />
          }
          label="Completed"
          value={completed}
          to="/patient/appointments"
        />
      </div>

      {/* QUICK LINKS */}
      <div style={styles.quickGrid}>
        <QuickLink
          to="/patient/book-appointment"
          icon={
            <PlusCircle
              size={18}
            />
          }
          title="Book Appointment"
          sub="Schedule doctor consultation"
        />

        <QuickLink
          to="/patient/prescriptions"
          icon={
            <FileText
              size={18}
            />
          }
          title="Prescriptions"
          sub="View medicines & reports"
        />

        <QuickLink
          to="/patient/profile"
          icon={
            <Settings
              size={18}
            />
          }
          title="My Profile"
          sub="Manage personal details"
        />
      </div>

      {/* TABLE */}
      {appointments.length >
        0 && (
        <div
          style={
            styles.tableCard
          }
        >
          <div
            style={
              styles.tableHead
            }
          >
            Recent
            Appointments
          </div>

          <table
            style={
              styles.table
            }
          >
            <thead>
              <tr>
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
              </tr>
            </thead>

            <tbody>
              {appointments
                .slice(
                  0,
                  5
                )
                .map(
                  (
                    a
                  ) => (
                    <tr
                      key={
                        a.id
                      }
                    >
                      <td
                        style={
                          td
                        }
                      >
                        {
                          a.doctorName
                        }
                      </td>

                      <td
                        style={
                          td
                        }
                      >
                        {
                          a.specialization
                        }
                      </td>

                      <td
                        style={
                          td
                        }
                      >
                        {
                          a.appointmentDate
                        }
                      </td>

                      <td
                        style={
                          td
                        }
                      >
                        {
                          a.slot
                        }
                      </td>

                      <td
                        style={
                          td
                        }
                      >
                        <StatusBadge
                          status={
                            a.status
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  to,
}) {
  return (
    <Link
      to={to}
      style={{
        textDecoration:
          'none',
      }}
    >
      <div
        style={
          styles.statCard
        }
      >
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
    </Link>
  );
}

function QuickLink({
  to,
  icon,
  title,
  sub,
}) {
  return (
    <Link
      to={to}
      style={{
        textDecoration:
          'none',
      }}
    >
      <div
        style={
          styles.quickCard
        }
      >
        <div
          style={
            styles.quickIcon
          }
        >
          {icon}
        </div>

        <div>
          <div
            style={
              styles.quickTitle
            }
          >
            {title}
          </div>

          <div
            style={
              styles.quickSub
            }
          >
            {sub}
          </div>
        </div>
      </div>
    </Link>
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
          '6px 10px',
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
      '0 10px 24px rgba(15,23,42,.05)',
    display: 'flex',
    gap: '14px',
    alignItems:
      'center',
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

  quickGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(250px,1fr))',
    gap: '18px',
    marginBottom:
      '24px',
  },

  quickCard: {
    background: '#fff',
    borderRadius:
      '18px',
    padding: '18px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,.05)',
    display: 'flex',
    gap: '14px',
    alignItems:
      'center',
  },

  quickIcon: {
    width: '44px',
    height: '44px',
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

  quickTitle: {
    fontWeight: '800',
    color: '#0f172a',
  },

  quickSub: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '3px',
  },

  tableCard: {
    background: '#fff',
    borderRadius:
      '22px',
    overflow: 'hidden',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
  },

  tableHead: {
    padding: '18px',
    fontWeight: '800',
    color: '#0f172a',
    borderBottom:
      '1px solid #eef2f7',
  },

  table: {
    width: '100%',
    borderCollapse:
      'collapse',
  },
};

const th = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '13px',
  color: '#64748b',
  background: '#f8fafc',
};

const td = {
  padding: '16px',
  fontSize: '13px',
  borderTop:
    '1px solid #f1f5f9',
};

export default PatientDashboard;