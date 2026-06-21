// src/pages/auth/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Mail,
  Lock,
  LogIn,
  Activity,
  X
} from 'lucide-react';

import axios from 'axios';

import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../api/authService';
import { useForm } from '../../hooks/useForm';
import { email as emailRule, required } from '../../utils/validators';
import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';

const ROLE_HOME = {
  PATIENT: '/patient/dashboard',
  DOCTOR: '/doctor/dashboard',
  ADMIN: '/admin/dashboard',
  SUPER_ADMIN: '/admin/dashboard',
};

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  /* FORGOT PASSWORD */
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(300);
  const [canResend, setCanResend] = useState(false);

  const { values, errors, handleChange, validate } = useForm(
    { email: '', password: '' },
    {
      email: emailRule,
      password: required('Password'),
    }
  );

  useEffect(() => {
    let timer;

    if (
      showForgotModal &&
      forgotStep === 2 &&
      secondsLeft > 0
    ) {
      timer = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }

    if (secondsLeft === 0) {
      setCanResend(true);
    }

    return () => clearTimeout(timer);
  }, [showForgotModal, forgotStep, secondsLeft]);

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${min}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError('');

    try {
      const res = await loginUser(
        values.email,
        values.password
      );

      const {
        token,
        email: userEmail,
        role,
      } = res.data;

      login(token, userEmail);

      navigate(
        ROLE_HOME[role] || '/login',
        { replace: true }
      );
    } catch (err) {
      setApiError(
  err.response?.data?.message ||
  err.response?.data?.error ||
  'Invalid credentials'
);
    } finally {
      setLoading(false);
    }
  };

  /* SEND OTP */
  const handleSendOtp = async () => {
    try {
      setForgotLoading(true);
      setForgotMsg('');

      const res = await axios.post(
        'http://localhost:8080/auth/forgot-password',
        { email: forgotEmail }
      );

      setForgotMsg(res.data);
      setForgotOtp(['', '', '', '', '', '']);
      setForgotStep(2);
      setSecondsLeft(300);
      setCanResend(false);
    } catch (err) {
      setForgotMsg(
  err.response?.data?.message ||
  err.response?.data?.error ||
  'Failed to send OTP'
);
    } finally {
      setForgotLoading(false);
    }
  };

  /* OTP INPUT */
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...forgotOtp];
    newOtp[index] = value;
    setForgotOtp(newOtp);

    if (value && index < 5) {
      document
        .getElementById(`otp-${index + 1}`)
        ?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === 'Backspace' &&
      !forgotOtp[index] &&
      index > 0
    ) {
      document
        .getElementById(`otp-${index - 1}`)
        ?.focus();
    }
  };

  /* VERIFY OTP */
  const handleVerifyOtp = async () => {
    try {
      setForgotLoading(true);
      setForgotMsg('');

      const res = await axios.post(
        'http://localhost:8080/auth/verify-otp',
        {
          email: forgotEmail,
          otp: forgotOtp.join(''),
        }
      );

      setForgotMsg(res.data);
      setForgotStep(3);
    } catch (err) {
      setForgotMsg(
        err.response?.data?.message ||
          err.response?.data ||
          'Invalid or expired OTP'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  /* RESET PASSWORD */
  const handleResetPassword = async () => {
    try {
      setForgotLoading(true);
      setForgotMsg('');

      const res = await axios.post(
        'http://localhost:8080/auth/reset-forgot-password',
        {
          email: forgotEmail,
          newPassword: forgotPassword,
        }
      );

      setForgotMsg(res.data);

      setTimeout(() => {
        closeForgotModal();
      }, 1500);
    } catch (err) {
      setForgotMsg(
        err.response?.data?.message ||
          err.response?.data ||
          'Failed to reset password'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail('');
    setForgotOtp(['', '', '', '', '', '']);
    setForgotPassword('');
    setForgotStep(1);
    setForgotMsg('');
    setSecondsLeft(300);
    setCanResend(false);
  };

  return (
    <>
      <div style={styles.page}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.brandWrap}>
            <div style={styles.brandIcon}>
              <Activity size={34} color="#ffffff" />
            </div>

            <h1 style={styles.brandTitle}>
              MediTrack
            </h1>

            <p style={styles.brandText}>
              Complete hospital management
              platform for appointments,
              doctors, patients,
              prescriptions, billing and
              care coordination.
            </p>

            <div style={styles.featureBox}>
              <div style={styles.featureItem}>
                <ShieldCheck size={18} />
                Smart Appointment Scheduling
              </div>

              <div style={styles.featureItem}>
                <Activity size={18} />
                Digital Prescriptions &
                Follow-ups
              </div>

              <div style={styles.featureItem}>
                <LogIn size={18} />
                Secure Patient &
                Doctor Access
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          <div style={styles.card}>
            <div style={styles.header}>
              <div style={styles.headerIcon}>
                <ShieldCheck
                  size={22}
                  color="#2563eb"
                />
              </div>

              <h2 style={styles.title}>
                Welcome Back
              </h2>

              <p style={styles.subtitle}>
                Sign in to continue to
                your dashboard
              </p>
            </div>

            <Alert
              type="error"
              message={apiError}
              onClose={() =>
                setApiError('')
              }
            />

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div style={styles.inputWrap}>
                <div style={styles.inputIcon}>
                  <Mail size={16} />
                </div>

                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="user@gmail.com"
                  required
                />
              </div>

              <div style={styles.inputWrap}>
                <div style={styles.inputIcon}>
                  <Lock size={16} />
                </div>

                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.btn,
                  opacity: loading ? 0.8 : 1,
                  cursor: loading
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                <LogIn size={18} />
                {loading
                  ? 'Signing in...'
                  : 'Login'}
              </button>

              <div style={styles.forgotRow}>
                <button
                  type="button"
                  onClick={() =>
                    setShowForgotModal(true)
                  }
                  style={styles.forgotBtn}
                >
                  Forgot Password?
                </button>
              </div>
            </form>

            <p style={styles.foot}>
              New patient?{' '}
              <Link
                to="/register"
                style={styles.link}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showForgotModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <button
              onClick={closeForgotModal}
              style={styles.closeBtn}
            >
              <X size={18} />
            </button>

            <h3 style={styles.modalTitle}>
              Forgot Password
            </h3>

            {forgotMsg && (
              <p style={styles.modalMsg}>
                {forgotMsg}
              </p>
            )}

            {/* STEP 1 */}
            {forgotStep === 1 && (
              <>
                <div
                  style={
                    styles.modalInputWrap
                  }
                >
                  <Mail
                    size={16}
                    style={
                      styles.modalInputIcon
                    }
                  />

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) =>
                      setForgotEmail(
                        e.target.value
                      )
                    }
                    style={
                      styles.modalInput
                    }
                  />
                </div>

                <button
                  onClick={
                    handleSendOtp
                  }
                  style={
                    styles.modalBtn
                  }
                >
                  {forgotLoading
                    ? 'Sending...'
                    : 'Send OTP'}
                </button>
              </>
            )}

            {/* STEP 2 */}
            {forgotStep === 2 && (
              <>
                <div style={styles.otpContainer}>
                  {forgotOtp.map(
                    (digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) =>
                          handleOtpChange(
                            e.target.value,
                            index
                          )
                        }
                        onKeyDown={(e) =>
                          handleOtpKeyDown(
                            e,
                            index
                          )
                        }
                        onFocus={(e) =>
                          (e.target.style.border =
                            '1.5px solid #2563eb')
                        }
                        onBlur={(e) =>
                          (e.target.style.border =
                            '1.5px solid #cbd5e1')
                        }
                        style={
                          styles.otpBox
                        }
                      />
                    )
                  )}
                </div>

                <div style={styles.timerText}>
                  OTP expires in{' '}
                  {formatTime(
                    secondsLeft
                  )}
                </div>

                <button
                  onClick={
                    handleVerifyOtp
                  }
                  style={
                    styles.modalBtn
                  }
                >
                  Verify OTP
                </button>

                {canResend && (
                  <button
                    onClick={
                      handleResendOtp
                    }
                    style={
                      styles.resendBtn
                    }
                  >
                    Resend OTP
                  </button>
                )}
              </>
            )}

            {/* STEP 3 */}
            {forgotStep === 3 && (
              <>
                <div
                  style={
                    styles.modalInputWrap
                  }
                >
                  <Lock
                    size={16}
                    style={
                      styles.modalInputIcon
                    }
                  />

                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={
                      forgotPassword
                    }
                    onChange={(e) =>
                      setForgotPassword(
                        e.target.value
                      )
                    }
                    style={
                      styles.modalInput
                    }
                  />
                </div>

                <button
                  onClick={
                    handleResetPassword
                  }
                  style={
                    styles.modalBtn
                  }
                >
                  {forgotLoading
                    ? 'Updating...'
                    : 'Reset Password'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    gridTemplateColumns:
      '1fr 520px',
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e3a8a 45%, #2563eb 100%)',
  },

  leftPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
  },

  brandWrap: {
    maxWidth: '520px',
    color: '#fff',
  },

  brandIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '20px',
    background:
      'rgba(255,255,255,0.14)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter:
      'blur(10px)',
    marginBottom: '24px',
  },

  brandTitle: {
    margin: 0,
    fontSize: '54px',
    fontWeight: '800',
  },

  brandText: {
    marginTop: '18px',
    fontSize: '18px',
    lineHeight: '1.7',
    color:
      'rgba(255,255,255,0.85)',
  },

  featureBox: {
    marginTop: '34px',
    display: 'grid',
    gap: '14px',
  },

  featureItem: {
    display: 'flex',
    gap: '10px',
    background:
      'rgba(255,255,255,0.10)',
    border:
      '1px solid rgba(255,255,255,0.12)',
    padding: '14px 16px',
    borderRadius: '14px',
  },

  rightPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background:
      'rgba(255,255,255,0.06)',
  },

  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#fff',
    borderRadius: '26px',
    padding: '34px',
    boxShadow:
      '0 25px 70px rgba(0,0,0,0.18)',
  },

  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },

  headerIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin:
      '0 auto 16px',
  },

  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800',
  },

  subtitle: {
    marginTop: '8px',
    color: '#64748b',
    fontSize: '14px',
  },

  inputWrap: {
    position: 'relative',
    marginBottom: '10px',
  },

  inputIcon: {
    position: 'absolute',
    right: '14px',
    top: '42px',
    zIndex: 2,
  },

  btn: {
    width: '100%',
    marginTop: '14px',
    height: '52px',
    border: 'none',
    borderRadius: '14px',
    background:
      'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '15px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    lineHeight: '1',
    padding: 0,
    cursor: 'pointer',
    boxShadow:
      '0 12px 25px rgba(37,99,235,0.25)',
  },

  forgotRow: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
  },

  forgotBtn: {
    border: 'none',
    background: 'none',
    color: '#2563eb',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },

  foot: {
    marginTop: '22px',
    textAlign: 'center',
    fontSize: '14px',
  },

  link: {
    color: '#2563eb',
    fontWeight: '700',
    textDecoration: 'none',
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background:
      'rgba(15,23,42,0.58)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },

  modalCard: {
    width: '100%',
    maxWidth: '460px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '30px',
    boxShadow:
      '0 25px 70px rgba(0,0,0,0.20)',
    position: 'relative',
  },

  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#64748b',
  },

  modalTitle: {
    margin: '0 0 18px',
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },

  modalMsg: {
    fontSize: '14px',
    color: '#2563eb',
    marginBottom: '14px',
    textAlign: 'center',
  },

  modalInputWrap: {
    position: 'relative',
    marginBottom: '14px',
  },

  modalInputIcon: {
    position: 'absolute',
    left: '14px',
    top: '14px',
    color: '#94a3b8',
  },

  modalInput: {
    width: '100%',
    height: '50px',
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    padding: '0 14px 0 42px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },

  modalBtn: {
    width: '100%',
    height: '50px',
    border: 'none',
    borderRadius: '14px',
    background:
      'linear-gradient(135deg,#2563eb,#1d4ed8)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    marginTop: '4px',
  },

  timerText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '10px',
  },

  resendBtn: {
    width: '100%',
    height: '48px',
    marginTop: '10px',
    borderRadius: '14px',
    border: '1px solid #2563eb',
    background: '#fff',
    color: '#2563eb',
    fontWeight: '700',
    cursor: 'pointer',
  },

  otpContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '18px',
    marginTop: '8px',
  },

  otpBox: {
    width: '48px',
    height: '54px',
    border:
      '1.5px solid #cbd5e1',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    outline: 'none',
    background: '#ffffff',
    transition: '0.2s ease',
    boxSizing: 'border-box',
  },
};

export default LoginPage;