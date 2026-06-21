// src/pages/patient/BookAppointment.jsx
// UI UPGRADE ONLY
// ALL EXISTING LOGIC KEPT SAME

import React, {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  CalendarDays,
  Stethoscope,
  Clock3,
  CreditCard,
  Search,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

import {
  getAvailableDoctors,
  getDoctorsBySpecialization
} from '../../api/doctorService';

import {
  getAvailableSlots,
  bookAppointment,
  markPaymentSuccess
} from '../../api/appointmentService';

import {
  createPayment,
  verifyPayment
} from '../../api/paymentService';

import {
  getMyProfile
} from '../../api/patientService';

import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

/* Razorpay loader */
function loadRazorpayScript() {
  return new Promise(
    (resolve) => {
      if (
        window.Razorpay
      ) {
        resolve(true);
        return;
      }

      const script =
        document.createElement(
          'script'
        );

      script.src =
        'https://checkout.razorpay.com/v1/checkout.js';

      script.onload =
        () =>
          resolve(true);

      script.onerror =
        () =>
          resolve(false);

      document.body.appendChild(
        script
      );
    }
  );
}

function BookAppointment() {
  const navigate =
    useNavigate();

  const [profile, setProfile] =
    useState(null);

  const [doctors, setDoctors] =
    useState([]);

  const [
    selectedDoctor,
    setSelectedDoctor
  ] = useState('');

  const [specialization, setSpecialization] =
  useState('');

  const [
    selectedDate,
    setSelectedDate
  ] = useState('');

  const [slots, setSlots] =
    useState([]);

  const [
    selectedSlot,
    setSelectedSlot
  ] = useState('');

  const [
    bookedAppointment,
    setBookedAppointment
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [
    slotsLoading,
    setSlotsLoading
  ] = useState(false);

  const [paying, setPaying] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const selectedDoctorObj =
  doctors.find(
    (d) =>
      String(d.id) ===
      String(selectedDoctor)
  );

const consultationFee =
  selectedDoctorObj?.consultationFee || 500;

  useEffect(() => {

  async function init() {

    try {

      let docRes;

      if (specialization) {

        docRes =
          await getDoctorsBySpecialization(
            specialization
          );

      } else {

        docRes =
          await getAvailableDoctors();

      }

      const profRes =
        await getMyProfile();

      setProfile(
        profRes.data
      );

      setDoctors(
        docRes.data
      );

    } catch {

      setError(
        'Failed to load page data. Please refresh.'
      );

    }
  }

  init();

}, [specialization]);
  const loadSlots =
    async () => {
      if (
        !selectedDoctor ||
        !selectedDate
      )
        return;

      setSlotsLoading(
        true
      );
      setSlots([]);
      setError('');

      try {
        const res =
          await getAvailableSlots(
            selectedDoctor,
            selectedDate
          );

        setSlots(
          res.data
        );

        if (
          res.data
            .length === 0
        ) {
          setError(
            'No slots available for this date.'
          );
        }
      } catch (err) {
        setError(
          err.response
            ?.data
            ?.message ||
            'Failed to fetch slots.'
        );
      } finally {
        setSlotsLoading(
          false
        );
      }
    };

  const handleBook =
    async () => {
      if (
        !selectedDoctor ||
        !selectedDate ||
        !selectedSlot
      ) {
        setError(
          'Please select a doctor, date, and slot.'
        );
        return;
      }

      setLoading(true);
      setError('');

      try {
        const res =
          await bookAppointment(
            {
              doctorId:
                Number(
                  selectedDoctor
                ),
              appointmentDate:
                selectedDate,
              slot:
                selectedSlot
            }
          );

        setBookedAppointment(
          res.data
        );

        setSuccess(
          'Appointment booked! Complete payment below to confirm it.'
        );
      } catch (err) {
        setError(
          err.response
            ?.data
            ?.message ||
            err.response
              ?.data ||
            'Booking failed.'
        );
      } finally {
        setLoading(false);
      }
    };

  const handlePay =
    async () => {
      if (
        !bookedAppointment
      )
        return;

      setPaying(true);
      setError('');

      try {
        const loaded =
          await loadRazorpayScript();

        if (!loaded) {
          setError(
            'Failed to load payment gateway.'
          );
          setPaying(
            false
          );
          return;
        }

        

        const doctorName =
          selectedDoctorObj
            ? `Dr. ${selectedDoctorObj.name}`
            : '';

        
        const patientName =
          profile?.name ||
          '';

        const payRes =
          await createPayment(
  bookedAppointment.id,
  consultationFee,
  patientName,
  doctorName
);

        const {
          orderId
        } =
          payRes.data;

        const options = {
          key:
            'rzp_test_SbMAm8PkRAhTBq',
          amount: consultationFee *100,
          currency:
            'INR',
          name:
            'MediTrack Healthcare',
          description: `Consultation Fee — Appointment #${bookedAppointment.id}`,
          order_id:
            orderId,

          handler:
            async function (
              response
            ) {
              try {
                await verifyPayment(
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  response.razorpay_signature
                );

                await markPaymentSuccess(
                  bookedAppointment.id
                );

                setSuccess(
                  'Payment successful! Appointment confirmed.'
                );

                setBookedAppointment(
                  null
                );

                setTimeout(
                  () =>
                    navigate(
                      '/patient/payments'
                    ),
                  1800
                );
              } catch {
                setError(
                  'Payment verified by Razorpay but backend verification failed.'
                );
              } finally {
                setPaying(
                  false
                );
              }
            },

          prefill: {
            name:
              patientName,
            email:
              profile?.email ||
              '',
            contact:
              profile?.phone ||
              ''
          },

          theme: {
            color:
              '#2563eb'
          },

          modal: {
            ondismiss:
              function () {
                setError(
                  'Payment cancelled. Your appointment is still pending payment.'
                );
                setPaying(
                  false
                );
              }
          }
        };

        const rzp =
          new window.Razorpay(
            options
          );

        rzp.on(
          'payment.failed',
          function (
            response
          ) {
            setError(
              `Payment failed: ${response.error.description}`
            );

            setPaying(
              false
            );
          }
        );

        rzp.open();
      } catch (err) {
        setError(
          err.response
            ?.data
            ?.message ||
            'Payment initiation failed.'
        );

        setPaying(false);
      }
    };

  const today =
    new Date()
      .toISOString()
      .split('T')[0];

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
        message={success}
        onClose={() =>
          setSuccess('')
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
            <CalendarDays
              size={24}
            />
          </div>

          <h1
            style={
              styles.title
            }
          >
            Book Appointment
          </h1>

          <p
            style={
              styles.sub
            }
          >
            Choose your
            doctor, pick
            a slot and
            confirm with
            secure payment.
          </p>
        </div>

        <div
          style={
            styles.heroMini
          }
        >
          <Sparkles
            size={20}
          />
          Fast Booking
        </div>
      </div>

      {/* FORM */}
      <label
  style={
    styles.label
  }
>
  Search by Specialization
</label>

<div
  style={
    styles.inputWrap
  }
>
  <Search
    size={18}
  />

  <select
    value={
      specialization
    }
    onChange={(
      e
    ) =>
      setSpecialization(
        e.target.value
      )
    }
    style={
      styles.select
    }
  >
    <option value="">
      All Specializations
    </option>

    <option value="CARDIOLOGIST">
      Cardiologist
    </option>

    <option value="DERMATOLOGIST">
      Dermatologist
    </option>

    <option value="ORTHOPEDIC">
      Orthopedic
    </option>

    <option value="NEUROLOGIST">
      Neurologist
    </option>

    <option value="ONCOLOGIST">
      Oncologist
    </option>

    <option value="PEDIATRICIAN">
      Pediatrician
    </option>

    <option value="GENERAL_PHYSICIAN">
      General Physician
    </option>
  </select>
</div>
      <div style={styles.card}>
        <label
          style={
            styles.label
          }
        >
          Select Doctor
        </label>

        <div
          style={
            styles.inputWrap
          }
        >
          <Stethoscope
            size={18}
          />

          <select
            value={
              selectedDoctor
            }
            onChange={(
              e
            ) => {
              setSelectedDoctor(
                e.target
                  .value
              );
              setSlots(
                []
              );
              setSelectedSlot(
                ''
              );
            }}
            style={
              styles.select
            }
          >
            <option value="">
              Choose
              Doctor
            </option>

            {doctors.length === 0 ? (

  <option disabled>
    No doctors available
  </option>

) : (

  doctors.map(
    (d) => (
      <option
        key={
          d.id
        }
        value={
          d.id
        }
      >
        Dr.{' '}
        {
          d.name
        }{' '}
        —{' '}
        {
          d.specialization
        }
      </option>
    )
  )

)}
          </select>
        </div>

        <label
          style={
            styles.label
          }
        >
          Appointment
          Date
        </label>

        <div
          style={
            styles.inputWrap
          }
        >
          <CalendarDays
            size={18}
          />

          <input
            type="date"
            min={today}
            value={
              selectedDate
            }
            onChange={(
              e
            ) => {
              setSelectedDate(
                e.target
                  .value
              );
              setSlots(
                []
              );
              setSelectedSlot(
                ''
              );
            }}
            style={
              styles.input
            }
          />
        </div>

        <button
          onClick={
            loadSlots
          }
          disabled={
            !selectedDoctor ||
            !selectedDate ||
            slotsLoading
          }
          style={
            styles.secondaryBtn
          }
        >
          <Search
            size={16}
          />
          {slotsLoading
            ? 'Loading...'
            : 'Check Available Slots'}
        </button>

        {/* SLOTS */}
        {slots.length >
          0 && (
          <>
            <div
              style={
                styles.slotTitle
              }
            >
              <Clock3
                size={16}
              />
              Available
              Slots
            </div>

            <div
              style={
                styles.slotWrap
              }
            >
              {slots.map(
                (
                  s
                ) => (
                  <button
                    key={
                      s.id
                    }
                    onClick={() =>
                      setSelectedSlot(
                        s.slotTime
                      )
                    }
                    style={{
                      ...styles.slotBtn,
                      ...(selectedSlot ===
                      s.slotTime
                        ? styles.slotActive
                        : {})
                    }}
                  >
                    {
                      s.slotTime
                    }
                  </button>
                )
              )}
            </div>
          </>
        )}

        {/* BOOK */}
        {!bookedAppointment ? (
          <button
            onClick={
              handleBook
            }
            disabled={
              loading ||
              !selectedSlot
            }
            style={
              styles.primaryBtn
            }
          >
            {loading
              ? 'Booking...'
              : 'Book Appointment'}
          </button>
        ) : (
          <div
            style={
              styles.payBox
            }
          >
            <div
              style={
                styles.payTop
              }
            >
              <CheckCircle2
                size={18}
              />
              Appointment #
              {
                bookedAppointment.id
              }{' '}
              Reserved
            </div>

            <p
              style={
                styles.payText
              }
            >
              Complete
              payment to
              confirm your
              consultation.
            </p>

            <button
              onClick={
                handlePay
              }
              disabled={
                paying
              }
              style={
                styles.payBtn
              }
            >
              <CreditCard
                size={16}
              />
              {paying
                ? 'Opening Payment...'
                : `Pay ₹${consultationFee} via Razorpay`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '28px',
    background:
      '#f4f7fb',
    minHeight:
      '100vh'
  },

  hero: {
    background:
      'linear-gradient(135deg,#0f172a,#1e40af,#2563eb)',
    color: '#fff',
    borderRadius:
      '24px',
    padding: '28px',
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    gap: '20px',
    marginBottom:
      '24px',
    boxShadow:
      '0 18px 40px rgba(37,99,235,.18)'
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
      '14px'
  },

  title: {
    margin: 0,
    fontSize:
      '30px',
    fontWeight:
      '800'
  },

  sub: {
    marginTop:
      '8px',
    color:
      'rgba(255,255,255,.88)',
    fontSize:
      '14px'
  },

  heroMini: {
    background:
      'rgba(255,255,255,.12)',
    padding:
      '14px 18px',
    borderRadius:
      '16px',
    fontWeight:
      '700',
    display: 'flex',
    gap: '8px',
    alignItems:
      'center'
  },

  card: {
    background:
      '#fff',
    borderRadius:
      '24px',
    padding: '28px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)'
  },

  label: {
    display:
      'block',
    fontWeight:
      '700',
    fontSize:
      '14px',
    marginBottom:
      '8px',
    marginTop:
      '12px'
  },

  inputWrap: {
    height: '52px',
    border:
      '1px solid #dbeafe',
    borderRadius:
      '14px',
    display: 'flex',
    alignItems:
      'center',
    gap: '10px',
    padding:
      '0 14px',
    background:
      '#f8fbff',
    color:
      '#64748b',
    marginBottom:
      '14px'
  },

  select: {
    border: 'none',
    outline: 'none',
    background:
      'transparent',
    width: '100%',
    fontSize:
      '14px'
  },

  input: {
    border: 'none',
    outline: 'none',
    background:
      'transparent',
    width: '100%',
    fontSize:
      '14px'
  },

  secondaryBtn: {
    width: '100%',
    border: 'none',
    background:
      '#e2e8f0',
    color:
      '#0f172a',
    padding:
      '14px',
    borderRadius:
      '14px',
    cursor:
      'pointer',
    fontWeight:
      '700',
    display: 'flex',
    justifyContent:
      'center',
    gap: '8px',
    marginTop:
      '8px'
  },

  slotTitle: {
    marginTop:
      '20px',
    marginBottom:
      '14px',
    fontWeight:
      '700',
    display: 'flex',
    gap: '8px',
    alignItems:
      'center'
  },

  slotWrap: {
    display: 'flex',
    flexWrap:
      'wrap',
    gap: '10px',
    marginBottom:
      '22px'
  },

  slotBtn: {
    border:
      '1px solid #bfdbfe',
    background:
      '#fff',
    color:
      '#2563eb',
    padding:
      '10px 16px',
    borderRadius:
      '999px',
    cursor:
      'pointer',
    fontWeight:
      '700'
  },

  slotActive: {
    background:
      '#2563eb',
    color: '#fff'
  },

  primaryBtn: {
    width: '100%',
    border: 'none',
    background:
      'linear-gradient(135deg,#1e40af,#2563eb)',
    color: '#fff',
    padding:
      '15px',
    borderRadius:
      '14px',
    cursor:
      'pointer',
    fontWeight:
      '800',
    fontSize:
      '15px'
  },

  payBox: {
    background:
      '#eff6ff',
    border:
      '1px solid #bfdbfe',
    borderRadius:
      '18px',
    padding: '22px',
    marginTop:
      '18px'
  },

  payTop: {
    display: 'flex',
    gap: '8px',
    alignItems:
      'center',
    color:
      '#2563eb',
    fontWeight:
      '800'
  },

  payText: {
    color:
      '#475569',
    fontSize:
      '14px',
    marginTop:
      '8px',
    marginBottom:
      '16px'
  },

  payBtn: {
    width: '100%',
    border: 'none',
    background:
      '#16a34a',
    color: '#fff',
    padding:
      '14px',
    borderRadius:
      '14px',
    cursor:
      'pointer',
    fontWeight:
      '800',
    display: 'flex',
    justifyContent:
      'center',
    gap: '8px'
  }
};

export default BookAppointment;