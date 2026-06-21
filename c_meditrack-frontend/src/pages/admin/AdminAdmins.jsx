// src/pages/admin/AdminAdmins.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllAdmins,
  deleteAdmin,
  resetAdminPassword
} from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

function AdminAdmins() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isSuperAdmin = role === 'SUPER_ADMIN';

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await getAllAdmins();
      setAdmins(res.data || []);
    } catch {
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    adminId,
    email,
    adminRole
  ) => {
    if (!isSuperAdmin) return;

    if (email === user?.email) {
      setError(
        'You cannot delete your own account.'
      );
      return;
    }

    if (adminRole === 'SUPER_ADMIN') {
      setError(
        'SUPER_ADMIN account cannot be deleted.'
      );
      return;
    }

    const ok = window.confirm(
      `Delete admin: ${email} ?`
    );

    if (!ok) return;

    try {
      await deleteAdmin(adminId);

      setAdmins((prev) =>
        prev.filter(
          (a) => a.id !== adminId
        )
      );

      setSuccess(
        'Admin deleted successfully'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Delete failed'
      );
    }
  };

  const handleResetPassword = async (
    adminId,
    email,
    adminRole
  ) => {
    if (!isSuperAdmin) return;

    if (adminRole === 'SUPER_ADMIN') {
      setError(
        'SUPER_ADMIN password cannot be reset here.'
      );
      return;
    }

    const password = window.prompt(
      `Enter new password for ${email}`
    );

    if (!password) return;

    try {
      await resetAdminPassword(
        adminId,
        password
      );

      setSuccess(
        'Password reset successful'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          'Password reset failed'
      );
    }
  };

  if (loading) return <Spinner />;

  return (
    <div style={styles.page}>
      {/* BACK BUTTON */}
      <button
        style={styles.backBtn}
        onClick={() =>
          navigate('/admin/dashboard')
        }
      >
        ← Back to Dashboard
      </button>

      {/* HEADER */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>
            🛡️ Manage Admins
          </h2>

          <p style={styles.sub}>
            View all administrator
            accounts
          </p>
        </div>

        <div style={styles.countCard}>
          <div style={styles.countNumber}>
            {admins.length}
          </div>

          <div style={styles.countText}>
            Total Admins
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
        message={success}
        onClose={() => setSuccess('')}
      />

      {/* TABLE */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headRow}>
              <th style={styles.th}>
                ID
              </th>
              <th style={styles.th}>
                Name
              </th>
              <th style={styles.th}>
                Email
              </th>
              <th style={styles.th}>
                Role
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
            {admins.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={styles.empty}
                >
                  No admins found
                </td>
              </tr>
            ) : (
              admins.map((admin) => {
                const self =
                  admin.email ===
                  user?.email;

                const superAcc =
                  admin.role ===
                  'SUPER_ADMIN';

                return (
                  <tr
                    key={admin.id}
                  >
                    <td style={styles.td}>
                      {admin.id}
                    </td>

                    <td style={styles.td}>
                      {admin.name ||
                        '-'}
                    </td>

                    <td style={styles.td}>
                      {admin.email}
                    </td>

                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background:
                            superAcc
                              ? '#6a1b9a'
                              : '#1565C0'
                        }}
                      >
                        {admin.role}
                      </span>
                    </td>

                    <td style={styles.td}>
                      {self ? (
                        <span
                          style={
                            styles.you
                          }
                        >
                          Current User
                        </span>
                      ) : (
                        <span
                          style={
                            styles.active
                          }
                        >
                          Active
                        </span>
                      )}
                    </td>

                    <td style={styles.td}>
                      {isSuperAdmin ? (
                        <div
                          style={
                            styles.actionWrap
                          }
                        >
                          {!superAcc && (
                            <>
                              <button
                                style={
                                  styles.resetBtn
                                }
                                onClick={() =>
                                  handleResetPassword(
                                    admin.id,
                                    admin.email,
                                    admin.role
                                  )
                                }
                              >
                                Reset
                              </button>

                              {!self && (
                                <button
                                  style={
                                    styles.deleteBtn
                                  }
                                  onClick={() =>
                                    handleDelete(
                                      admin.id,
                                      admin.email,
                                      admin.role
                                    )
                                  }
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}

                          {superAcc && (
                            <span
                              style={
                                styles.locked
                              }
                            >
                              Protected
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          style={
                            styles.viewOnly
                          }
                        >
                          View Only
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
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

  headerRow: {
    background:
      'linear-gradient(135deg,#0f172a,#1e40af,#2563eb)',
    color: '#fff',
    borderRadius: '24px',
    padding: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '24px',
    boxShadow:
      '0 18px 40px rgba(37,99,235,0.18)',
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

  countCard: {
    minWidth: '125px',
    height: '92px',
    borderRadius: '18px',
    background:
      'rgba(255,255,255,0.12)',
    border:
      '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backdropFilter: 'blur(6px)',
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

  card: {
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

  headRow: {
    background: '#f8fafc',
  },

  th: {
    textAlign: 'left',
    padding: '16px 18px',
    fontSize: '13px',
    fontWeight: '800',
    color: '#64748b',
    background: '#f8fafc',
    borderBottom:
      '1px solid #e2e8f0',
  },

  td: {
    padding: '16px 18px',
    fontSize: '13px',
    borderTop:
      '1px solid #f1f5f9',
    color: '#0f172a',
    verticalAlign: 'middle',
  },

  badge: {
    color: '#fff',
    padding: '7px 12px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '.3px',
  },

  active: {
    color: '#16a34a',
    fontWeight: '700',
    background: '#f0fdf4',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
  },

  you: {
    color: '#2563eb',
    fontWeight: '700',
    background: '#eff6ff',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
  },

  actionWrap: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },

  resetBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#f59e0b,#f97316)',
    color: '#fff',
    padding: '9px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    boxShadow:
      '0 8px 16px rgba(245,158,11,0.18)',
  },

  deleteBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#ef4444,#dc2626)',
    color: '#fff',
    padding: '9px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    boxShadow:
      '0 8px 16px rgba(239,68,68,0.18)',
  },

  locked: {
    color: '#7c3aed',
    fontWeight: '700',
    background: '#f3e8ff',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
  },

  viewOnly: {
    color: '#64748b',
    fontWeight: '700',
    background: '#f8fafc',
    padding: '6px 10px',
    borderRadius: '999px',
    fontSize: '12px',
  },

  empty: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    fontWeight: '600',
  },
};

export default AdminAdmins;