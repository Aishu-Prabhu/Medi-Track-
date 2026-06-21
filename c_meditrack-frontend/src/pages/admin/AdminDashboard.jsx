// src/pages/admin/AdminDashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCog,
  Shield,
  CalendarDays,
  FileText,
  PlusCircle,
  Stethoscope,
  ClipboardList,
  ArrowRight,
  Activity
} from 'lucide-react';

import { getAllPatients } from '../../api/patientService';
import { getAllDoctors } from '../../api/doctorService';
import { getAllAppointments } from '../../api/appointmentService';
import { getAllPrescriptions } from '../../api/prescriptionService';
import { getAllAdmins } from '../../api/authService';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    admins: 0,
    appointments: 0,
    prescriptions: 0
  });

  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.allSettled([
          getAllPatients(),
          getAllDoctors(),
          getAllAppointments(),
          getAllPrescriptions(),
          getAllAdmins()
        ]);

        const patients =
          results[0].status === 'fulfilled'
            ? results[0].value.data
            : [];

        const doctors =
          results[1].status === 'fulfilled'
            ? results[1].value.data
            : [];

        const appointments =
          results[2].status === 'fulfilled'
            ? results[2].value.data
            : [];

        const prescriptions =
          results[3].status === 'fulfilled'
            ? results[3].value.data
            : [];

        const admins =
          results[4].status === 'fulfilled'
            ? results[4].value.data
            : [];

        setStats({
          patients: patients.length,
          doctors: doctors.length,
          admins: admins.length,
          appointments: appointments.length,
          prescriptions: prescriptions.length
        });

        setRecentAppts(
          [...appointments]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5)
        );

        const failed = results.some(
          (r) => r.status === 'rejected'
        );

        if (failed) {
          setError(
            'Some dashboard data could not be loaded.'
          );
        }
      } catch {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <Shield size={28} />
          </div>

          <h1 style={styles.title}>
            Admin Dashboard
          </h1>

          <p style={styles.subtitle}>
            Monitor hospital operations,
            appointments, users , doctors 
            and Admins for real time.
          </p>
        </div>

        <div style={styles.heroRight}>
          <Activity size={60} />
        </div>
      </div>

      <Alert
        type="error"
        message={error}
        onClose={() => setError('')}
      />

      {/* STATS */}
      <div style={styles.grid}>
        <StatCard
          icon={<Users size={22} />}
          label="Patients"
          value={stats.patients}
          color="#2563eb"
          to="/admin/patients"
        />

        <StatCard
          icon={<Stethoscope size={22} />}
          label="Doctors"
          value={stats.doctors}
          color="#16a34a"
          to="/admin/doctors"
        />

        <StatCard
          icon={<Shield size={22} />}
          label="Admins"
          value={stats.admins}
          color="#7c3aed"
          to="/admin/admins"
        />

        <StatCard
          icon={<CalendarDays size={22} />}
          label="Appointments"
          value={stats.appointments}
          color="#ea580c"
          to="/admin/appointments"
        />

        <StatCard
          icon={<FileText size={22} />}
          label="Prescriptions"
          value={stats.prescriptions}
          color="#0891b2"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Quick Actions
        </div>

        <div style={styles.quickGrid}>
          <QuickLink
            to="/admin/create-doctor"
            icon={<PlusCircle size={18} />}
            label="Add Doctor"
          />

          <QuickLink
            to="/admin/create-admin"
            icon={<Shield size={18} />}
            label="Add Admin"
          />

          <QuickLink
            to="/admin/doctors"
            icon={<Stethoscope size={18} />}
            label="Doctors"
          />

          <QuickLink
            to="/admin/admins"
            icon={<UserCog size={18} />}
            label="Manage Admins"
          />

          <QuickLink
            to="/admin/patients"
            icon={<Users size={18} />}
            label="Patients"
          />

          <QuickLink
            to="/admin/appointments"
            icon={<ClipboardList size={18} />}
            label="Appointments"
          />
        </div>
      </div>

      {/* RECENT */}
      <div style={styles.section}>
        <div style={styles.topBar}>
          <div style={styles.sectionTitle}>
            Recent Appointments
          </div>

          <Link
            to="/admin/appointments"
            style={styles.viewBtn}
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {recentAppts.length === 0 ? (
          <div style={styles.empty}>
            No appointments found.
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={styles.th}>
                    Patient
                  </th>
                  <th style={styles.th}>
                    Doctor
                  </th>
                  <th style={styles.th}>
                    Date
                  </th>
                  <th style={styles.th}>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentAppts.map((a) => (
                  <tr key={a.id}>
                    <td style={styles.td}>
                      {a.id}
                    </td>

                    <td style={styles.td}>
                      {a.patientName ||
                        '-'}
                    </td>

                    <td style={styles.td}>
                      {a.doctorName ||
                        '-'}
                    </td>

                    <td style={styles.td}>
                      {a.appointmentDate ||
                        '-'}
                    </td>

                    <td style={styles.td}>
                      <StatusBadge
                        status={a.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* STAT CARD */
function StatCard({
  icon,
  label,
  value,
  color,
  to
}) {
  const content = (
    <div
      style={{
        ...styles.card,
        background: color
      }}
    >
      <div style={styles.cardIcon}>
        {icon}
      </div>

      <div style={styles.cardValue}>
        {value}
      </div>

      <div style={styles.cardLabel}>
        {label}
      </div>
    </div>
  );

  return to ? (
    <Link
      to={to}
      style={{
        textDecoration: 'none'
      }}
    >
      {content}
    </Link>
  ) : (
    content
  );
}

/* QUICK LINK */
function QuickLink({
  to,
  icon,
  label
}) {
  return (
    <Link to={to} style={styles.quickBtn}>
      {icon}
      {label}
    </Link>
  );
}

/* STATUS */
function StatusBadge({
  status
}) {
  const map = {
    PENDING_PAYMENT: '#f59e0b',
    CONFIRMED: '#16a34a',
    COMPLETED: '#2563eb',
    CANCELLED: '#dc2626'
  };

  return (
    <span
      style={{
        background:
          map[status] || '#64748b',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '700'
      }}
    >
      {status}
    </span>
  );
}

const styles = {
  page: {
    padding: '28px',
    background: '#f4f7fb',
    minHeight: '100vh'
  },

  hero: {
    background:
      'linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)',
    color: '#fff',
    borderRadius: '24px',
    padding: '34px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '26px',
    boxShadow: '0 18px 40px rgba(30,64,175,0.18)'
  },

  heroIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14px'
  },

  title: {
    margin: 0,
    fontSize: '34px',
    fontWeight: '800',
    letterSpacing: '-0.5px'
  },

  subtitle: {
    marginTop: '10px',
    fontSize: '15px',
    color: 'rgba(255,255,255,0.88)',
    maxWidth: '640px',
    lineHeight: '1.6'
  },

  heroRight: {
    opacity: 0.2
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
    gap: '18px',
    marginBottom: '26px'
  },

  card: {
    padding: '18px',
    borderRadius: '18px',
    color: '#fff',
    minHeight: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
    transition: '0.25s ease'
  },

  cardIcon: {
    marginBottom: '10px',
    opacity: 0.95
  },

  cardValue: {
    fontSize: '35px',
    fontWeight: '800',
    lineHeight: 1
  },

  cardLabel: {
    marginTop: '6px',
    fontSize: '14px',
    opacity: 0.95,
    fontWeight: '500'
  },

  section: {
    background: '#ffffff',
    borderRadius: '22px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 10px 28px rgba(15,23,42,0.06)'
  },

  sectionTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '18px'
  },

  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
    gap: '14px'
  },

  quickBtn: {
    textDecoration: 'none',
    color: '#1e3a8a',
    border: '1px solid #dbeafe',
    background: '#f8fbff',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontWeight: '700',
    transition: '0.2s ease',
    boxShadow: '0 6px 14px rgba(37,99,235,0.06)'
  },

  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  viewBtn: {
    textDecoration: 'none',
    color: '#2563eb',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  tableWrap: {
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 10px'
  },

  th: {
    textAlign: 'left',
    padding: '14px',
    fontSize: '13px',
    color: '#64748b'
  },

  td: {
    padding: '16px',
    fontSize: '14px',
    background: '#f8fafc'
  },

  empty: {
    padding: '22px',
    color: '#64748b'
  }
};

export default AdminDashboard;