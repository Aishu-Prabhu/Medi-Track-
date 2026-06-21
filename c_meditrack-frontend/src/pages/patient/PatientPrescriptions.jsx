// src/pages/patient/PatientPrescriptions.jsx
// PREMIUM UI ONLY - LOGIC UNCHANGED

import React, { useEffect, useState } from 'react';
import {
  Pill,
  Download,
  FileText,
  CalendarDays,
  UserRound,
} from 'lucide-react';

import { getMyProfile } from '../../api/patientService';
import { getPrescriptionsByPatient } from '../../api/prescriptionService';
import { downloadPrescriptionPDF } from '../../utils/pdfUtils';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] =
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

        const res =
          await getPrescriptionsByPatient(
            profRes.data.id
          );

        setPrescriptions(
          res.data
        );
      } catch {
        setError(
          'Failed to load prescriptions'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading)
    return <Spinner />;

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
            <Pill
              size={24}
            />
          </div>

          <h1
            style={
              styles.title
            }
          >
            My Prescriptions
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Access medicines,
            diagnosis, doctor
            notes and download
            prescription PDF
            anytime.
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
              prescriptions.length
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

      {/* CONTENT */}
      {prescriptions.length ===
      0 ? (
        <div
          style={
            styles.emptyState
          }
        >
          No prescriptions
          yet.
        </div>
      ) : (
        <div
          style={
            styles.listWrap
          }
        >
          {prescriptions.map(
            (p) => (
              <PrescriptionCard
                key={p.id}
                prescription={
                  p
                }
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function PrescriptionCard({
  prescription: p,
}) {
  return (
    <div
      id={`prescription-${p.id}`}
      style={styles.card}
    >
      <div
        style={
          styles.topRow
        }
      >
        <div>
          <div
            style={
              styles.idBadge
            }
          >
            <FileText
              size={14}
            />
            Prescription #
            {p.id}
          </div>

          <div
            style={
              styles.metaRow
            }
          >
            <span
              style={
                styles.metaItem
              }
            >
              <UserRound
                size={14}
              />
              Dr.{' '}
              {
                p.doctorName
              }
            </span>

            <span
              style={
                styles.metaItem
              }
            >
              <CalendarDays
                size={14}
              />
              {
                p.prescriptionDate
              }
            </span>
          </div>
        </div>

        <button
          onClick={() =>
            downloadPrescriptionPDF(
              p
            )
          }
          style={
            styles.pdfBtn
          }
        >
          <Download
            size={15}
          />
          Download PDF
        </button>
      </div>

      <div
        style={
          styles.grid
        }
      >
        <InfoRow
          label="Diagnosis"
          value={
            p.diagnosis
          }
        />

        <InfoRow
          label="Medicines"
          value={
            p.medicines
          }
        />

        <InfoRow
          label="Notes"
          value={
            p.notes ||
            'None'
          }
        />

        <InfoRow
          label="Follow-up Date"
          value={
            p.followUpDate
          }
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}) {
  return (
    <div
      style={
        styles.infoCard
      }
    >
      <div
        style={
          styles.infoLabel
        }
      >
        {label}
      </div>

      <div
        style={
          styles.infoValue
        }
      >
        {value}
      </div>
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
    lineHeight: '1.6',
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
    opacity: 0.9,
  },

  emptyState: {
    background: '#fff',
    padding: '40px',
    borderRadius:
      '22px',
    textAlign:
      'center',
    color: '#64748b',
    fontWeight: '600',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
  },

  listWrap: {
    display: 'flex',
    flexDirection:
      'column',
    gap: '18px',
  },

  card: {
    background: '#fff',
    padding: '24px',
    borderRadius:
      '22px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
  },

  topRow: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'flex-start',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom:
      '18px',
  },

  idBadge: {
    display: 'inline-flex',
    alignItems:
      'center',
    gap: '8px',
    background:
      '#eff6ff',
    color: '#2563eb',
    padding:
      '8px 12px',
    borderRadius:
      '999px',
    fontWeight: '800',
    fontSize: '13px',
    marginBottom:
      '12px',
  },

  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },

  metaItem: {
    display: 'flex',
    alignItems:
      'center',
    gap: '6px',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '600',
  },

  pdfBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#1e40af,#2563eb)',
    color: '#fff',
    padding:
      '11px 16px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '13px',
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
    boxShadow:
      '0 8px 18px rgba(37,99,235,.18)',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(240px,1fr))',
    gap: '14px',
  },

  infoCard: {
    background:
      '#f8fbff',
    border:
      '1px solid #e0ecff',
    borderRadius:
      '16px',
    padding: '16px',
  },

  infoLabel: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#2563eb',
    marginBottom:
      '8px',
    textTransform:
      'uppercase',
    letterSpacing:
      '.4px',
  },

  infoValue: {
    fontSize: '14px',
    color: '#0f172a',
    lineHeight: '1.6',
    fontWeight: '600',
  },
};

export default PatientPrescriptions;