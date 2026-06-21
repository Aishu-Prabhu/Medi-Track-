// src/pages/patient/PatientPayments.jsx
// FULL PAGE UI UPGRADED + ORIGINAL PDF RECEIPT RESTORED

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import {
  CreditCard,
  Wallet,
  Receipt,
  CalendarDays,
  UserRound,
  Download,
} from 'lucide-react';

import { getMyProfile } from '../../api/patientService';
import { getAppointmentsByPatient } from '../../api/appointmentService';
import {
  createPayment,
  verifyPayment,
} from '../../api/paymentService';

import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';

const PAYMENT_STATUS = {
  PENDING_PAYMENT: {
    label: 'Unpaid',
    bg: '#fff7ed',
    color: '#f97316',
  },
  CONFIRMED: {
    label: 'Paid',
    bg: '#ecfdf5',
    color: '#16a34a',
  },
  COMPLETED: {
    label: 'Paid',
    bg: '#ecfdf5',
    color: '#16a34a',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: '#fef2f2',
    color: '#dc2626',
  },
  REFUNDED: {
    label: 'Refunded',
    bg: '#eff6ff',
    color: '#2563eb',
  },
};

function PatientPayments() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profRes = await getMyProfile();
      setProfile(profRes.data);

      const apptRes = await getAppointmentsByPatient(
        profRes.data.id
      );

      setAppointments([...apptRes.data].reverse());
    } catch {
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });

  const handlePendingPayment = async (a) => {
    try {
      const loaded = await loadRazorpay();

      if (!loaded) {
        setError('Unable to load Razorpay');
        return;
      }

      const payRes = await createPayment(
        a.id,
        a.consultationFee,
        profile?.name,
        a.doctorName
      );

      const { orderId } = payRes.data;

      const options = {
        key: 'rzp_test_SbMAm8PkRAhTBq',
        amount: a.consultationFee * 100,
        currency: 'INR',
        name: 'MediTrack',
        description: `Appointment #${a.id}`,
        order_id: orderId,

        handler: async function (response) {
  try {
    await verifyPayment(
      response.razorpay_order_id,
      response.razorpay_payment_id,
      response.razorpay_signature
    );

    await loadData(); // refresh payments list only

    navigate('/patient/payments'); // stay on payments page
  } catch {
    setError('Payment verification failed');
  }
},

        prefill: {
          name: profile?.name || '',
          email: profile?.email || '',
          contact: profile?.phone || '',
        },

        theme: {
          color: '#2563eb',
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch {
      setError('Unable to start payment');
    }
  };

  // ORIGINAL PDF RECEIPT RESTORED
  const downloadReceipt = (a) => {
    const doc = new jsPDF();

    doc.setFillColor(21, 101, 192);
    doc.rect(0, 0, 210, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MediTrack HealthCare', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Payment Receipt', 145, 18);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT RECEIPT', 14, 45);

    doc.line(14, 50, 196, 50);

    let y = 64;

    const rows = [
      ['Receipt Number', `RCT-${a.id}`],
      ['Appointment ID', `#${a.id}`],
      ['Patient Name', profile?.name],
      ['Doctor Name', `Dr. ${a.doctorName}`],
      ['Department', a.specialization],
      ['Date', a.appointmentDate],
      ['Time', a.slot],
      ['Amount', `₹${a.consultationFee}`],
      ['Method', 'Razorpay'],
      ['Status', 'SUCCESS'],
      ['Generated On', new Date().toLocaleString()],
    ];

    rows.forEach((row) => {
      doc.setFont('helvetica', 'bold');
      doc.text(row[0], 14, y);

      doc.setFont('helvetica', 'normal');
      doc.text(String(row[1]), 78, y);

      y += 10;
    });

    doc.setTextColor(46, 125, 50);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID ✓', 145, 125);

    doc.setTextColor(110);
    doc.setFontSize(10);

    doc.text(
      'Thank you for choosing MediTrack HealthCare.',
      14,
      270
    );

    doc.text(
      'This is a System generated receipt.',
      14,
      277
    );

    doc.save(`MediTrack_Receipt_${a.id}.pdf`);
  };

  if (loading) return <Spinner />;

  const paid = appointments.filter(
    (a) =>
      a.status === 'CONFIRMED' ||
      a.status === 'COMPLETED'
  ).length;

  const pending = appointments.filter(
    (a) => a.status === 'PENDING_PAYMENT'
  ).length;

  const total = appointments
  .filter(
    (a) =>
      a.status === 'CONFIRMED' ||
      a.status === 'COMPLETED'
  )
  .reduce(
    (sum, a) =>
      sum + (a.consultationFee || 0),
    0
  );

  return (
    <div style={styles.page}>
      <Alert
        type="error"
        message={error}
        onClose={() => setError('')}
      />

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <div style={styles.heroIcon}>
            <CreditCard size={24} />
          </div>

          <h1 style={styles.title}>
            Payments & Billing
          </h1>

          <p style={styles.subtitle}>
            Manage transactions, receipts and pending
            consultation payments.
          </p>
        </div>

        <div style={styles.countCard}>
          <div style={styles.countNumber}>
            ₹{total}
          </div>
          <div style={styles.countText}>
            Total Paid
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsWrap}>
        <StatCard
          icon={<Wallet size={18} />}
          label="Paid"
          value={paid}
        />

        <StatCard
          icon={<CreditCard size={18} />}
          label="Pending"
          value={pending}
        />

        <StatCard
          icon={<Receipt size={18} />}
          label="Total Records"
          value={appointments.length}
        />
      </div>

      {/* LIST */}
      {appointments.length === 0 ? (
        <div style={styles.emptyBox}>
          No payments found.

          <span
            style={styles.link}
            onClick={() =>
              navigate('/patient/book-appointment')
            }
          >
            Book Appointment
          </span>
        </div>
      ) : (
        <div style={styles.listWrap}>
          {appointments.map((a) => {
            let key = a.status;

            if (
              a.status === 'CANCELLED' &&
              a.refundStatus
            ) {
              key = 'REFUNDED';
            }

            const ps = PAYMENT_STATUS[key];

            return (
              <div key={a.id} style={styles.payCard}>
                <div style={styles.left}>
                  <div style={styles.topLine}>
                    <span style={styles.idBadge}>
                      Appt #{a.id}
                    </span>

                    <span
                      style={{
                        ...styles.statusBadge,
                        background: ps.bg,
                        color: ps.color,
                      }}
                    >
                      {ps.label}
                    </span>
                  </div>

                  <div style={styles.meta}>
                    <UserRound size={14} />
                    Dr. {a.doctorName}
                  </div>

                  <div style={styles.meta}>
                    <CalendarDays size={14} />
                    {a.appointmentDate} • {a.slot}
                  </div>
                </div>

                <div style={styles.right}>
                  <div style={styles.amount}>
                    ₹{a.consultationFee}
                    <p>Consultation fee</p>
                  </div>

                  {(a.status === 'CONFIRMED' ||
                    a.status === 'COMPLETED') && (
                    <button
                      style={styles.receiptBtn}
                      onClick={() =>
                        downloadReceipt(a)
                      }
                    >
                      <Download size={14} />
                      Receipt
                    </button>
                  )}

                  {a.status ===
                    'PENDING_PAYMENT' && (
                    <button
                      style={styles.payBtn}
                      onClick={() =>
                        handlePendingPayment(a)
                      }
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>

      <div>
        <div style={styles.statValue}>
          {value}
        </div>

        <div style={styles.statLabel}>
          {label}
        </div>
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
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '24px',
  },

  heroIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,.14)',
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
    color: 'rgba(255,255,255,.86)',
    fontSize: '14px',
  },

  countCard: {
    minWidth: '140px',
    height: '92px',
    borderRadius: '18px',
    background: 'rgba(255,255,255,.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countNumber: {
    fontSize: '24px',
    fontWeight: '800',
  },

  countText: {
    fontSize: '12px',
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
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    boxShadow:
      '0 10px 24px rgba(15,23,42,.05)',
  },

  statIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: '24px',
    fontWeight: '800',
  },

  statLabel: {
    fontSize: '13px',
    color: '#64748b',
  },

  listWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  payCard: {
    background: '#fff',
    borderRadius: '22px',
    padding: '22px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
  },

  left: {
    flex: 1,
  },

  right: {
    textAlign: 'right',
  },

  topLine: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },

  idBadge: {
    background: '#eff6ff',
    color: '#2563eb',
    padding: '8px 12px',
    borderRadius: '999px',
    fontWeight: '800',
    fontSize: '13px',
  },

  statusBadge: {
    padding: '7px 12px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '12px',
  },

  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#475569',
    fontSize: '14px',
    marginBottom: '8px',
  },

  amount: {
    fontSize: '12px',
    fontWeight: '800',
    marginBottom: '10px',
  },

  payBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#f97316,#ea580c)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
  },

  receiptBtn: {
    border: 'none',
    background:
      'linear-gradient(135deg,#1e40af,#2563eb)',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'inline-flex',
    gap: '8px',
    alignItems: 'center',
  },

  emptyBox: {
    background: '#fff',
    padding: '40px',
    borderRadius: '22px',
    textAlign: 'center',
    color: '#64748b',
  },

  link: {
    marginLeft: '8px',
    color: '#2563eb',
    cursor: 'pointer',
    fontWeight: '700',
  },
};

export default PatientPayments;