// src/pages/admin/AdminDoctors.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCog,
  Search,
  Trash2,
  Power,
  Mail,
  Stethoscope,
  BriefcaseMedical,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';

import {
  getAllDoctors,
  deleteDoctor,
  toggleDoctorAvailability,
} from '../../api/doctorService';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

function AdminDoctors() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    getAllDoctors()
      .then((r) => {
        setDoctors(r.data);
        setFiltered(r.data);
      })
      .catch(() =>
        setError('Failed to load doctors')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();

    if (!q) {
      setFiltered(doctors);
      return;
    }

    setFiltered(
      doctors.filter((d) =>
        `${d.id} ${d.name} ${d.email} ${d.specialization}`
          .toLowerCase()
          .includes(q)
      )
    );
  }, [search, doctors]);

  const handleDelete = async (id) => {
    const ok = window.confirm(
      'Delete this doctor permanently?'
    );

    if (!ok) return;

    try {
      await deleteDoctor(id);

      const updated = doctors.filter(
        (d) => d.id !== id
      );

      setDoctors(updated);
      setFiltered(updated);

      setMsg(
        'Doctor deleted successfully'
      );
    } catch {
      setError('Delete failed');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res =
        await toggleDoctorAvailability(id);

      const updated = doctors.map((d) =>
        d.id === id ? res.data : d
      );

      setDoctors(updated);
      setFiltered(updated);

      setMsg(
        'Availability updated'
      );
    } catch {
      setError(
        'Failed to update availability'
      );
    }
  };

  if (loading) return <Spinner />;

  const availableCount =
    doctors.filter((d) => d.available)
      .length;

  return (
    <div style={styles.page}>
      {/* BACK BUTTON */}
      <button
        onClick={() =>
          navigate('/admin/dashboard')
        }
        style={styles.backBtn}
      >
        ← Back to Dashboard
      </button>

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <UserCog size={28} />
          </div>

          <h1 style={styles.title}>
            Doctor Management
          </h1>

          <p style={styles.subtitle}>
            Manage doctors,
            availability, profiles,
            and hospital workforce
            operations.
          </p>
        </div>

        <div style={styles.heroStats}>
          <div style={styles.statCard}>
            <span
              style={styles.statNum}
            >
              {doctors.length}
            </span>
            <span
              style={styles.statText}
            >
              Total Doctors
            </span>
          </div>

          <div style={styles.statCard}>
            <span
              style={styles.statNum}
            >
              {availableCount}
            </span>
            <span
              style={styles.statText}
            >
              Available
            </span>
          </div>
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

      {/* SEARCH */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <Search size={18} />
          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search by ID, name, email, specialization"
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                #
              </th>
              <th style={styles.th}>
                Doctor
              </th>
              <th style={styles.th}>
                Contact
              </th>
              <th style={styles.th}>
                Specialization
              </th>
              <th style={styles.th}>
                Experience
              </th>
              <th style={styles.th}>
                Status
              </th>
              <th style={styles.th}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={styles.empty}
                >
                  No doctors found
                </td>
              </tr>
            ) : (
              filtered.map((d) => (
                <tr
                  key={d.id}
                  style={styles.row}
                >
                  <td style={styles.td}>
                    {d.id}
                  </td>

                  <td style={styles.td}>
                    <div
                      style={
                        styles.userWrap
                      }
                    >
                      <div
                        style={
                          styles.avatar
                        }
                      >
                        <UserCog
                          size={16}
                        />
                      </div>

                      <div>
                        <div
                          style={
                            styles.name
                          }
                        >
                          {d.name}
                        </div>

                        <div
                          style={
                            styles.sub
                          }
                        >
                          Doctor ID #
                          {d.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={styles.td}>
                    <div
                      style={
                        styles.infoLine
                      }
                    >
                      <Mail
                        size={14}
                      />
                      {d.email}
                    </div>
                  </td>

                  <td style={styles.td}>
                    <span
                      style={
                        styles.specBadge
                      }
                    >
                      <Stethoscope
                        size={13}
                      />
                      {
                        d.specialization
                      }
                    </span>
                  </td>

                  <td style={styles.td}>
                    <div
                      style={
                        styles.infoLine
                      }
                    >
                      <BriefcaseMedical
                        size={14}
                      />
                      {
                        d.experience
                      }{' '}
                      yrs
                    </div>
                  </td>

                  <td style={styles.td}>
                    {d.available ? (
                      <span
                        style={
                          styles.greenBadge
                        }
                      >
                        <ShieldCheck
                          size={13}
                        />
                        Available
                      </span>
                    ) : (
                      <span
                        style={
                          styles.redBadge
                        }
                      >
                        <ShieldX
                          size={13}
                        />
                        Disabled
                      </span>
                    )}
                  </td>

                  <td style={styles.td}>
                    <div
                      style={
                        styles.actionWrap
                      }
                    >
                      <button
                        onClick={() =>
                          handleToggle(
                            d.id
                          )
                        }
                        style={
                          d.available
                            ? styles.disableBtn
                            : styles.enableBtn
                        }
                      >
                        <Power
                          size={14}
                        />
                        {d.available
                          ? 'Disable'
                          : 'Enable'}
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            d.id
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
                    </div>
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

  backBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#1d4ed8,#2563eb)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    marginBottom: '20px',
    boxShadow:
      '0 10px 20px rgba(37,99,235,.15)',
  },

  hero: {
    background:
      'linear-gradient(135deg,#0f172a,#1e3a8a,#2563eb)',
    borderRadius: '24px',
    padding: '28px',
    color: '#fff',
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems: 'center',
    gap: '24px',
    marginBottom: '22px',
    boxShadow:
      '0 18px 40px rgba(37,99,235,.18)',
  },

  heroIcon: {
    width: '58px',
    height: '58px',
    borderRadius: '18px',
    background:
      'rgba(255,255,255,.12)',
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
    fontSize: '14px',
    lineHeight: '1.6',
    maxWidth: '620px',
    color:
      'rgba(255,255,255,.88)',
  },

  heroStats: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
  },

  statCard: {
    minWidth: '150px',
    padding: '18px',
    borderRadius: '18px',
    background:
      'rgba(255,255,255,.12)',
    border:
      '1px solid rgba(255,255,255,.12)',
    textAlign: 'center',
  },

  statNum: {
    display: 'block',
    fontSize: '30px',
    fontWeight: '800',
  },

  statText: {
    fontSize: '13px',
    opacity: 0.9,
  },

  toolbar: {
    background: '#fff',
    borderRadius: '18px',
    padding: '18px',
    marginBottom: '20px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,.05)',
  },

  searchWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid #dbeafe',
    borderRadius: '14px',
    padding: '0 14px',
    height: '48px',
    background: '#f8fbff',
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
      '0 12px 28px rgba(15,23,42,.06)',
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
    transition: '.2s',
  },

  userWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },

  avatar: {
    width: '40px',
    height: '40px',
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
    marginTop: '4px',
  },

  infoLine: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#334155',
    fontSize: '13px',
  },

  specBadge: {
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

  greenBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '999px',
    background: '#ecfdf5',
    color: '#16a34a',
    fontWeight: '700',
    fontSize: '12px',
  },

  redBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 12px',
    borderRadius: '999px',
    background: '#fef2f2',
    color: '#dc2626',
    fontWeight: '700',
    fontSize: '12px',
  },

  actionWrap: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  enableBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#16a34a,#22c55e)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontWeight: '700',
    fontSize: '13px',
  },

  disableBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#f59e0b,#f97316)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontWeight: '700',
    fontSize: '13px',
  },

  deleteBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontWeight: '700',
    fontSize: '13px',
  },

  empty: {
    padding: '28px',
    textAlign: 'center',
    color: '#64748b',
  },
};

export default AdminDoctors;