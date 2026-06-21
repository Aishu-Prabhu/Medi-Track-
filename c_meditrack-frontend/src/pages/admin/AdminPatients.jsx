// src/pages/admin/AdminPatients.jsx

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Trash2,
  Mail,
  Phone,
  Droplets,
  UserRound,
} from 'lucide-react';

import {
  getAllPatients,
  deletePatient,
} from '../../api/patientService';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import BackButton from '../../components/common/BackButton';

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();

    if (!q) {
      setFiltered(patients);
      return;
    }

    setFiltered(
      patients.filter((p) =>
        `${p.id} ${p.name} ${p.email} ${p.phone} ${p.bloodGroup}`
          .toLowerCase()
          .includes(q)
      )
    );
  }, [search, patients]);

  const loadPatients = () => {
    getAllPatients()
      .then((r) => {
        setPatients(r.data);
        setFiltered(r.data);
      })
      .catch(() =>
        setError('Failed to load patients')
      )
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      'Delete this patient permanently?'
    );

    if (!ok) return;

    try {
      await deletePatient(id);

      const updated = patients.filter(
        (p) => p.id !== id
      );

      setPatients(updated);
      setFiltered(updated);

      setMsg(
        'Patient deleted successfully'
      );
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={styles.page}>
      <BackButton to="/admin/dashboard" />

      {/* HEADER */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <Users size={26} />
          </div>

          <h1 style={styles.title}>
            Patient Management
          </h1>

          <p style={styles.subtitle}>
            View, search and manage all
            registered patients in the
            MediTrack platform.
          </p>
        </div>

        <div style={styles.countCard}>
          <span style={styles.countNumber}>
            {patients.length}
          </span>
          <span style={styles.countText}>
            Total Patients
          </span>
        </div>
      </div>

      <Alert
        type="error"
        message={error}
        onClose={() => setError('')}
      />

      <Alert
        type="success"
        message={msg}
        onClose={() => setMsg('')}
      />

      {/* TOOLBAR */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={18} />
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search by ID, name, email, phone, blood group"
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>
                Patient
              </th>
              <th style={styles.th}>
                Contact
              </th>
              <th style={styles.th}>
                Age
              </th>
              <th style={styles.th}>
                Blood Group
              </th>
              <th style={styles.th}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={styles.empty}
                >
                  No patients found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p.id}
                  style={styles.row}
                >
                  <td style={styles.td}>
                    {p.id}
                  </td>

                  <td style={styles.td}>
                    <div
                      style={
                        styles.nameWrap
                      }
                    >
                      <div
                        style={
                          styles.avatar
                        }
                      >
                        <UserRound
                          size={16}
                        />
                      </div>

                      <div>
                        <div
                          style={
                            styles.name
                          }
                        >
                          {p.name}
                        </div>

                        <div
                          style={
                            styles.sub
                          }
                        >
                          ID #{p.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div
                      style={
                        styles.contactLine
                      }
                    >
                      <Mail
                        size={14}
                      />
                      {p.email}
                    </div>

                    <div
                      style={
                        styles.contactLine
                      }
                    >
                      <Phone
                        size={14}
                      />
                      {p.phone}
                    </div>
                  </td>

                  <td style={styles.td}>
                    {p.age}
                  </td>

                  <td style={styles.td}>
                    <span
                      style={
                        styles.badge
                      }
                    >
                      <Droplets
                        size={13}
                      />
                      {p.bloodGroup}
                    </span>
                  </td>

                  <td style={styles.td}>
                    <button
                      onClick={() =>
                        handleDelete(
                          p.id
                        )
                      }
                      style={
                        styles.deleteBtn
                      }
                    >
                      <Trash2
                        size={14}
                      />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
    justifyContent: 'center',
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
    maxWidth: '600px',
    lineHeight: '1.6',
    fontSize: '14px',
  },

  countCard: {
    minWidth: '180px',
    background:
      'rgba(255,255,255,0.12)',
    border:
      '1px solid rgba(255,255,255,0.12)',
    borderRadius: '18px',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  countNumber: {
    fontSize: '34px',
    fontWeight: '800',
  },

  countText: {
    fontSize: '13px',
    marginTop: '6px',
    opacity: 0.9,
  },

  toolbar: {
    background: '#fff',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '20px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,0.05)',
  },

  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #dbeafe',
    background: '#f8fbff',
    borderRadius: '14px',
    padding: '0 14px',
    height: '48px',
    color: '#64748b',
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    fontSize: '14px',
  },

  tableWrap: {
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

  th: {
    textAlign: 'left',
    padding: '16px',
    background: '#f8fafc',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '700',
    borderBottom:
      '1px solid #e5e7eb',
  },

  td: {
    padding: '16px',
    fontSize: '14px',
    borderBottom:
      '1px solid #f1f5f9',
    verticalAlign: 'top',
  },

  row: {
    transition: '0.2s',
  },

  nameWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontWeight: '700',
    color: '#0f172a',
  },

  sub: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '3px',
  },

  contactLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
    color: '#334155',
    fontSize: '13px',
  },

  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '999px',
    background: '#eff6ff',
    color: '#2563eb',
    fontWeight: '700',
    fontSize: '12px',
  },

  deleteBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow:
      '0 10px 18px rgba(239,68,68,0.18)',
  },

  empty: {
    padding: '28px',
    textAlign: 'center',
    color: '#64748b',
  },
};

export default AdminPatients;