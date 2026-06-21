// src/pages/doctor/DoctorDashboard.jsx


import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  CalendarDays,
  Clock3,
  CheckCircle2,
  UserRound,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import {
  getAllDoctors,
  toggleDoctorAvailability
} from '../../api/doctorService';
import { getAppointmentsByDoctor } from '../../api/appointmentService';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

function DoctorDashboard() {
  const { user } = useAuth();

  const [appointments, setAppointments] =
    useState([]);

  const [doctor, setDoctor] =
  useState(null);

  const [doctorId, setDoctorId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

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
          setDoctor(myDoc);
          setDoctorId(myDoc.id);

          const apptRes =
            await getAppointmentsByDoctor(
              myDoc.id
            );

          setAppointments(
            apptRes.data
          );
        }
      } catch {
        setError(
          'Failed to load dashboard'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const toggleAvailability =
  async () => {

    try {

      const updated =
        await toggleDoctorAvailability(
          doctor.id
        );

      setDoctor(updated.data);

    } catch {

      setError(
        'Failed to update availability'
      );
    }
  };

  if (loading) return <Spinner />;

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

  const todayAppts =
    appointments.filter(
      (a) =>
        a.appointmentDate ===
        today
    );

  const pending =
    appointments.filter(
      (a) =>
        a.status ===
        'CONFIRMED'
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
          <div style={styles.heroIcon}>
            <Stethoscope size={26} />
          </div>

          <h1 style={styles.title}>
            Doctor Dashboard
          </h1>

          <p style={styles.subtitle}>
            Welcome back, Dr.{' '}
            {user?.name ||
              user?.email}
            . Manage today’s
            schedule, monitor
            appointments and stay
            productive.
          </p>
        </div>

        <div style={styles.countCard}>
          <div
            style={
              styles.countNumber
            }
          >
            {appointments.length}
          </div>

          <div
            style={
              styles.countText
            }
          >
            Total Cases
          </div>
        </div>
      </div>

      <div style={styles.availabilityCard}>

  <div>
    <div style={styles.availabilityTitle}>
      Availability Status
    </div>

    <div style={styles.availabilityText}>
      Control whether patients
      can book appointments.
    </div>
  </div>

  <button
    onClick={toggleAvailability}
    style={{
      background: doctor?.available
        ? '#22c55e'
        : '#ef4444',

      color: '#fff',

      border: 'none',

      padding: '12px 22px',

      borderRadius: '14px',

      fontWeight: '700',

      cursor: 'pointer',

      fontSize: '14px'
    }}
  >
    {doctor?.available
      ? 'Available'
      : 'Unavailable'}
  </button>

</div>

      {/* STATS */}
      <div style={styles.statsWrap}>
        <StatCard
          icon={
            <CalendarDays
              size={18}
            />
          }
          label="Total Appointments"
          value={
            appointments.length
          }
        />

        <StatCard
          icon={
            <Clock3
              size={18}
            />
          }
          label="Today's Appointments"
          value={
            todayAppts.length
          }
        />

        <StatCard
          icon={
            <CheckCircle2
              size={18}
            />
          }
          label="Confirmed"
          value={pending}
        />
      </div>

      {/* TODAY LIST */}
      <div style={styles.card}>
        <div
          style={
            styles.sectionHead
          }
        >
          <h3 style={styles.h3}>
            Today's Schedule
          </h3>

          <span
            style={
              styles.dateBadge
            }
          >
            {today}
          </span>
        </div>

        {todayAppts.length ===
        0 ? (
          <div
            style={
              styles.empty
            }
          >
            No appointments
            today.
          </div>
        ) : (
          <div
            style={
              styles.listWrap
            }
          >
            {todayAppts.map(
              (a) => (
                <div
                  key={a.id}
                  style={
                    styles.apptCard
                  }
                >
                  <div
                    style={
                      styles.timeBox
                    }
                  >
                    <Clock3
                      size={
                        14
                      }
                    />
                    {a.slot}
                  </div>

                  <div
                    style={
                      styles.patientWrap
                    }
                  >
                    <UserRound
                      size={
                        16
                      }
                    />
                    {
                      a.patientName
                    }
                  </div>

                  <span
                    style={badge(
                      a.status
                    )}
                  >
                    {a.status.replaceAll(
                      '_',
                      ' '
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </div>
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

const STATUS_COLORS = {
  PENDING_PAYMENT:
    '#f59e0b',
  CONFIRMED:
    '#16a34a',
  COMPLETED:
    '#2563eb',
  CANCELLED:
    '#dc2626',
};

const badge = (s) => ({
  marginLeft: 'auto',
  background:
    STATUS_COLORS[s] ||
    '#64748b',
  color: '#fff',
  padding: '7px 12px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: '800',
  letterSpacing: '.3px',
});

const styles = {
  page: {
    padding: '28px',
    background: '#f4f7fb',
    minHeight: '100vh',
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
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    boxShadow:
      '0 18px 40px rgba(37,99,235,0.18)',
  },

  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background:
      'rgba(255,255,255,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent:
      'center',
    marginBottom: '14px',
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
    maxWidth: '620px',
    lineHeight: '1.6',
    fontSize: '14px',
  },

  countCard: {
    minWidth: '125px',
    height: '92px',
    borderRadius: '18px',
    background:
      'rgba(255,255,255,0.12)',
    border:
      '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    flexDirection:
      'column',
    alignItems: 'center',
    justifyContent:
      'center',
    padding: '10px',
    backdropFilter:
      'blur(6px)',
  },

  countNumber: {
    fontSize: '26px',
    fontWeight: '800',
    lineHeight: '1',
    marginBottom: '6px',
  },

  countText: {
    fontSize: '11px',
    fontWeight: '600',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: '1.3',
  },

  availabilityCard: {
  background: '#fff',

  borderRadius: '20px',

  padding: '20px 24px',

  marginBottom: '24px',

  display: 'flex',

  justifyContent:
    'space-between',

  alignItems: 'center',

  boxShadow:
    '0 10px 24px rgba(15,23,42,0.06)',
},

availabilityTitle: {
  fontSize: '18px',

  fontWeight: '800',

  color: '#0f172a',

  marginBottom: '6px',
},

availabilityText: {
  color: '#64748b',

  fontSize: '14px',
},

  statsWrap: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(220px,1fr))',
    gap: '18px',
    marginBottom: '24px',
  },

  statCard: {
    background: '#fff',
    borderRadius: '18px',
    padding: '18px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  statIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
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
    marginTop: '2px',
  },

  card: {
    background: '#fff',
    borderRadius: '22px',
    padding: '22px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,0.06)',
  },

  sectionHead: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    marginBottom: '18px',
  },

  h3: {
    margin: 0,
    fontSize: '20px',
    color: '#0f172a',
  },

  dateBadge: {
    background: '#eff6ff',
    color: '#2563eb',
    padding: '8px 12px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '700',
  },

  empty: {
    color: '#64748b',
    padding: '18px 0',
  },

  listWrap: {
    display: 'flex',
    flexDirection:
      'column',
    gap: '12px',
  },

  apptCard: {
    background: '#fff',
    border:
      '1px solid #eef2f7',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },

  timeBox: {
    background: '#eff6ff',
    color: '#2563eb',
    padding: '8px 12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '700',
    minWidth: '110px',
  },

  patientWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#0f172a',
    fontWeight: '700',
  },
};

export default DoctorDashboard;