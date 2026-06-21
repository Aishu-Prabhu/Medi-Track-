// src/pages/doctor/DoctorPrescriptions.jsx
// PREMIUM UI FULL CODE - LOGIC PRESERVED

import React, { useEffect, useState } from 'react';
import {
  FileText,
  PlusCircle,
  Edit3,
  Pill,
  ClipboardPlus,
  Search,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { getAllDoctors } from '../../api/doctorService';
import {
  getAppointmentsByDoctor,
  completeAppointment,
} from '../../api/appointmentService';
import {
  getPrescriptionsByDoctor,
  addPrescription,
  updatePrescription,
} from '../../api/prescriptionService';

import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';

function DoctorPrescriptions() {
  const { user } = useAuth();

  const [doctorInfo, setDoctorInfo] =
    useState(null);

  const [appointments, setAppointments] =
    useState([]);

  const [prescriptions, setPrescriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [addForm, setAddForm] =
    useState({
      appointmentId: '',
      diagnosis: '',
      medicines: '',
      notes: '',
      followUpDate: '',
    });

  const [addErrors, setAddErrors] =
    useState({});

  const [editingId, setEditingId] =
    useState(null);

  

  const [editForm, setEditForm] =
    useState({
      diagnosis: '',
      medicines: '',
      notes: '',
      followUpDate: '',
    });

  const [searchTerm,
  setSearchTerm] =
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
          setDoctorInfo(myDoc);

          const [
            apptRes,
            prescRes,
          ] =
            await Promise.all(
              [
                getAppointmentsByDoctor(
                  myDoc.id
                ),
                getPrescriptionsByDoctor(
                  myDoc.id
                ),
              ]
            );

          const today =
  new Date()
    .toISOString()
    .split('T')[0];

setAppointments(
  apptRes.data.filter(
    (a) =>
      a.status ===
        'CONFIRMED' &&
      a.appointmentDate <=
        today
  )
);

          setPrescriptions(
            prescRes.data
          );
        }
      } catch {
        setError(
          'Failed to load data'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const handleAddChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setAddForm((p) => ({
      ...p,
      [name]: value,
    }));

    if (addErrors[name]) {
      setAddErrors((p) => ({
        ...p,
        [name]: '',
      }));
    }
  };

  const validateAdd =
    () => {
      const errs = {};

      if (
        !addForm.appointmentId
      )
        errs.appointmentId =
          'Select appointment';

      if (
        !addForm.diagnosis ||
        addForm.diagnosis
          .length < 5
      )
        errs.diagnosis =
          'Minimum 5 characters';

      if (
        !addForm.medicines
      )
        errs.medicines =
          'Required';

      if (
        !addForm.followUpDate
      )
        errs.followUpDate =
          'Required';

      setAddErrors(errs);

      return (
        Object.keys(errs)
          .length === 0
      );
    };

  const handleAdd =
    async (e) => {
      e.preventDefault();

      if (
        !validateAdd()
      )
        return;

      const appt =
        appointments.find(
          (a) =>
            String(a.id) ===
            String(
              addForm.appointmentId
            )
        );

      if (!appt) {
        setError(
          'Appointment not found'
        );
        return;
      }

      setSaving(true);

      try {
        const res =
          await addPrescription(
            {
              appointmentId:
                Number(
                  addForm.appointmentId
                ),
              patientId:
                appt.patientId,
              doctorId:
                doctorInfo.id,
              diagnosis:
                addForm.diagnosis,
              medicines:
                addForm.medicines,
              notes:
                addForm.notes,
              followUpDate:
                addForm.followUpDate,
            }
          );

        setPrescriptions(
          (p) => [
            res.data,
            ...p,
          ]
        );

        setSuccess(
          'Prescription added successfully'
        );

        setAddForm({
          appointmentId:
            '',
          diagnosis:
            '',
          medicines:
            '',
          notes: '',
          followUpDate:
            '',
        });
      } catch {
        setError(
          'Failed to add prescription'
        );
      } finally {
        setSaving(false);
      }
    };

  const startEdit = (
    p
  ) => {
    setEditingId(p.id);

    setEditForm({
      diagnosis:
        p.diagnosis,
      medicines:
        p.medicines,
      notes:
        p.notes ||
        '',
      followUpDate:
        p.followUpDate,
    });
  };

  const cancelEdit =
    () => {
      setEditingId(
        null
      );

      setEditForm({
        diagnosis:
          '',
        medicines:
          '',
        notes: '',
        followUpDate:
          '',
      });
    };

  const handleEditChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setEditForm((p) => ({
        ...p,
        [name]: value,
      }));
    };

  const handleCompleteConsultation =
  async (
    appointmentId
  ) => {

    try {

      await completeAppointment(
        appointmentId
      );

      setAppointments(
  (prev) =>
    prev.map((a) =>
      a.id ===
      appointmentId
        ? {
            ...a,
            status:
              'COMPLETED',
          }
        : a
    )
);

      setSuccess(
        'Consultation completed successfully'
      );

    } catch {

      setError(
        'Failed to complete consultation'
      );
    }
  };

  const handleUpdate =
    async (id) => {
      setSaving(true);

      try {
        const res =
          await updatePrescription(
            id,
            editForm
          );

        setPrescriptions(
          (prev) =>
            prev.map(
              (p) =>
                p.id ===
                id
                  ? res.data
                  : p
            )
        );

        setSuccess(
          'Prescription updated'
        );

        cancelEdit();
      } catch {
        setError(
          'Update failed'
        );
      } finally {
        setSaving(false);
      }
    };

  if (loading)
    return <Spinner />;

  const tomorrow =
    new Date();

  tomorrow.setDate(
    tomorrow.getDate() +
      1
  );

  const minDate =
    tomorrow
      .toISOString()
      .split('T')[0];

  const filteredPrescriptions =
  prescriptions.filter(
    (p) => {

      const term =
        searchTerm.toLowerCase();

      return (
        p.patientName
          ?.toLowerCase()
          .includes(term) ||

        String(p.id)
          .includes(term) ||

        String(
          p.appointmentId
        ).includes(term)
      );
    }
  );

  const apptOptions =
    appointments.map(
      (a) => ({
        value: a.id,
        label: `#${a.id} - ${a.patientName} (${a.appointmentDate} ${a.slot})`,
      })
    );

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
            <FileText
              size={24}
            />
          </div>

          <h1
            style={
              styles.title
            }
          >
            Prescriptions
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            Create and manage
            patient
            prescriptions with
            professional
            workflow tools.
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

      {/* ADD FORM */}
      <div style={styles.card}>
        <div
          style={
            styles.sectionHead
          }
        >
          <PlusCircle
            size={18}
          />
          Write New
          Prescription
        </div>

        {appointments.length ===
        0 ? (
          <div
            style={
              styles.emptyBox
            }
          >
            No confirmed
            appointments
            available.
          </div>
        ) : (
          <form
            onSubmit={
              handleAdd
            }
          >
            <div
              style={
                styles.grid
              }
            >
              <FormInput
                label="Appointment"
                name="appointmentId"
                value={
                  addForm.appointmentId
                }
                onChange={
                  handleAddChange
                }
                error={
                  addErrors.appointmentId
                }
                options={
                  apptOptions
                }
                required
              />

              <FormInput
                label="Follow Up Date"
                name="followUpDate"
                type="date"
                value={
                  addForm.followUpDate
                }
                onChange={
                  handleAddChange
                }
                error={
                  addErrors.followUpDate
                }
                min={
                  minDate
                }
                required
              />
            </div>

            <FormInput
              label="Diagnosis"
              name="diagnosis"
              placeholder="Eg: Viral Fever with Cough"
              value={
                addForm.diagnosis
              }
              onChange={
                handleAddChange
              }
              error={
                addErrors.diagnosis
              }
              required
            />

            <FormInput
              label="Medicines"
              name="medicines"
              placeholder="Eg: Paracetamol 500mg - Twice Daily"
              value={
                addForm.medicines
              }
              onChange={
                handleAddChange
              }
              error={
                addErrors.medicines
              }
              required
            />

            <FormInput
              label="Notes"
              name="notes"
              placeholder="Eg: Drink more water and avoid cold foods"
              value={
                addForm.notes
              }
              onChange={
                handleAddChange
              }
            />

            <button
              type="submit"
              disabled={
                saving
              }
              style={
                styles.primaryBtn
              }
            >
              <ClipboardPlus
                size={16}
              />
              {saving
                ? 'Saving...'
                : 'Add Prescription'}
            </button>
          </form>
        )}
      </div>

      {/* LIST */}
      <h3 style={styles.listTitle}>
        My Prescriptions
      </h3>
     <div style={styles.searchWrap}>

  <Search
    size={18}
    style={styles.searchIcon}
  />

  <input
    type="text"
    placeholder="Search by Patient Name, Prescription ID or Appointment ID"
    value={searchTerm}
    onChange={(e) =>
      setSearchTerm(
        e.target.value
      )
    }
    style={styles.searchInput}
  />
</div>

      <div style={styles.listWrap}>
        {filteredPrescriptions.map(
          (p) => (
            <div
              key={p.id}
              style={
                styles.prescCard
              }
            >
              <div
                style={
                  styles.topRow
                }
              >
                <div>
                  <span
                    style={
                      styles.idTag
                    }
                  >
                    #
                    {
                      p.id
                    }
                  </span>{' '}
                  {
                    p.patientName
                  }
                </div>

                {editingId !==
                  p.id && (
                  <button
                    onClick={() =>
                      startEdit(
                        p
                      )
                    }
                    style={
                      styles.editBtn
                    }
                  >
                    <Edit3
                      size={
                        14
                      }
                    />
                    Edit
                  </button>
                )}

              {appointments.find(
  (a) =>
    a.id ===
      p.appointmentId &&
    a.status !==
      'COMPLETED'
) && (
  <button
    onClick={() =>
      handleCompleteConsultation(
        p.appointmentId
      )
    }
    style={
      styles.completeBtn
    }
  >
    <ClipboardPlus
      size={14}
    />
    Complete
  </button>
)}  
              </div>

              {editingId ===
              p.id ? (
                <>
                  <div
                    style={
                      styles.grid
                    }
                  >
                    <FormInput
                      label="Diagnosis"
                      name="diagnosis"
                      placeholder={"Eg: Viral Fever with Cough"}
                      value={
                        editForm.diagnosis
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <FormInput
                      label="Follow Up Date"
                      type="date"
                      name="followUpDate"
                      value={
                        editForm.followUpDate
                      }
                      onChange={
                        handleEditChange
                      }
                    />
                  </div>

                  <FormInput
                    label="Medicines"
                    name="medicines"
                    placeholder={"Eg: Paracetamol 50mg, Astroplo 1 tablet-daily Morning"}
                    value={
                      editForm.medicines
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                  <FormInput
                    label="Notes"
                    name="notes"
                    placeholder={"Eg: Avoid Icy foods, Drink more Water"}
                    value={
                      editForm.notes
                    }
                    onChange={
                      handleEditChange
                    }
                  />

                  <div
                    style={
                      styles.btnRow
                    }
                  >
                    <button
                      onClick={() =>
                        handleUpdate(
                          p.id
                        )
                      }
                      style={
                        styles.primaryBtn
                      }
                    >
                      Save
                    </button>

                    <button
                      onClick={
                        cancelEdit
                      }
                      style={
                        styles.cancelBtn
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div
                  style={
                    styles.infoWrap
                  }
                >
                  <Info
                    label="Diagnosis"
                    value={
                      p.diagnosis
                    }
                  />
                  <Info
                    label="Medicines"
                    value={
                      p.medicines
                    }
                  />
                  {p.notes && (
                    <Info
                      label="Notes"
                      value={
                        p.notes
                      }
                    />
                  )}
                  <Info
                    label="Follow Up"
                    value={
                      p.followUpDate
                    }
                  />
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}) {
  return (
    <div>
      <span
        style={
          styles.label
        }
      >
        {label}:
      </span>{' '}
      {value}
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
    opacity: 0.9,
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

  card: {
    background: '#fff',
    padding: '24px',
    borderRadius:
      '22px',
    boxShadow:
      '0 12px 28px rgba(15,23,42,.06)',
    marginBottom:
      '24px',
  },

  sectionHead: {
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
    fontWeight: '800',
    marginBottom:
      '18px',
    color: '#0f172a',
  },

  emptyBox: {
    padding: '18px',
    background:
      '#f8fafc',
    borderRadius:
      '14px',
    color: '#64748b',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      '1fr 1fr',
    gap: '16px',
  },

  primaryBtn: {
    marginTop: '10px',
    border: 'none',
    background:
      'linear-gradient(135deg,#1e40af,#2563eb)',
    color: '#fff',
    padding:
      '12px 18px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'flex',
    alignItems:
      'center',
    gap: '8px',
  },

  listTitle: {
    fontSize: '22px',
    fontWeight: '800',
    marginBottom:
      '14px',
  },
  searchWrap: {
  position: 'relative',

  marginBottom: '18px',

  width: '480px',

  maxWidth: '100%',
},

searchIcon: {
  position: 'absolute',

  left: '16px',

  top: '50%',

  transform:
    'translateY(-50%)',

  color: '#64748b',
},

  searchInput: {
  width: '100%',

  padding: '14px 18px',

  borderRadius: '14px',

  border:
    '1px solid #dbe3ee',

  paddingLeft: '46px',


  outline: 'none',

  fontSize: '14px',

  background: '#fff',
},

  listWrap: {
    display: 'flex',
    flexDirection:
      'column',
    gap: '16px',
  },

  prescCard: {
    background: '#fff',
    padding: '22px',
    borderRadius:
      '20px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,.05)',
  },

  topRow: {
    display: 'flex',
    justifyContent:
      'space-between',
    alignItems:
      'center',
    marginBottom:
      '14px',
  },

  idTag: {
    color: '#2563eb',
    fontWeight: '800',
  },

  completeBtn: {
  border: 'none',

  background:
    'linear-gradient(135deg,#16a34a,#22c55e)',

  color: '#fff',

  padding:
    '8px 14px',

  borderRadius:
    '10px',

  cursor: 'pointer',

  fontWeight: '700',

  display: 'flex',

  gap: '6px',

  alignItems:
    'center',
},

  editBtn: {
    border: 'none',
    background:
      '#eff6ff',
    color: '#2563eb',
    padding:
      '8px 14px',
    borderRadius:
      '10px',
    cursor: 'pointer',
    fontWeight: '700',
    display: 'flex',
    gap: '6px',
    alignItems:
      'center',
  },

  infoWrap: {
    display: 'grid',
    gap: '8px',
  },

  label: {
    color: '#2563eb',
    fontWeight: '700',
  },

  btnRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },

  cancelBtn: {
    border: 'none',
    background:
      '#f1f5f9',
    color: '#334155',
    padding:
      '12px 18px',
    borderRadius:
      '12px',
    cursor: 'pointer',
    fontWeight: '700',
  },
};

export default DoctorPrescriptions;