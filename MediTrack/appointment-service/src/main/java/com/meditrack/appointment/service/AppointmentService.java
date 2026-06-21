package com.meditrack.appointment.service;

import com.meditrack.appointment.client.DoctorClient;

import com.meditrack.appointment.client.PatientClient;
import com.meditrack.appointment.client.PaymentClient;
import com.meditrack.appointment.client.AuthClient;
import com.meditrack.appointment.dto.AppointmentRequest;
import com.meditrack.appointment.dto.DoctorResponse;
import com.meditrack.appointment.dto.PatientResponse;
import com.meditrack.appointment.dto.UserResponse;
import com.meditrack.appointment.entity.Appointment;
import com.meditrack.appointment.entity.AppointmentStatus;
import com.meditrack.appointment.event.NotificationEvent;
import com.meditrack.appointment.exception.AccessDeniedException;
import com.meditrack.appointment.exception.BadRequestException;
import com.meditrack.appointment.exception.ResourceNotFoundException;
import com.meditrack.appointment.repository.AppointmentRepository;
import com.meditrack.appointment.security.SecurityUtil;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private static final Logger log =
            LoggerFactory.getLogger(AppointmentService.class);

    private final AppointmentRepository appointmentRepository;
    private final DoctorClient doctorClient;
    private final SlotService slotService;
    private final AuthClient authClient;
    private final PatientClient patientClient;
    private final PaymentClient paymentClient;
 
    private final KafkaProducerService kafkaProducerService;


    // ─── BOOK APPOINTMENT ─────────────────────────────────────────────────────
    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {

        if (request == null) {
            throw new BadRequestException("Appointment request body cannot be null.");
        }

        String email = SecurityUtil.getLoggedInUserEmail();
        UserResponse user = authClient.getUserByEmail(email);

        if (user == null) {
            throw new ResourceNotFoundException("User not found for email: " + email);
        }

        PatientResponse patient;
        try {
            patient = patientClient.getPatientByEmail(email);
        } catch (Exception e) {
            log.error("Failed to fetch patient for userId={} error={}", user.getId(), e.getMessage());
            throw new ResourceNotFoundException("Patient profile not found for this user. Please complete your profile first.");
        }

        if (patient == null) {
            throw new ResourceNotFoundException("Patient profile not found.");
        }

        log.info("Patient fetched: id={} name={}", patient.getId(), patient.getName());

        Appointment appointment = new Appointment();
        appointment.setPatientId(patient.getId());
        appointment.setPatientName(patient.getName());
        appointment.setDoctorId(request.getDoctorId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setSlot(request.getSlot());

        log.info("Booking request | patientId={}, doctorId={}, date={}, slot={}",
                patient.getId(), request.getDoctorId(),
                request.getAppointmentDate(), request.getSlot());

        if (request.getDoctorId() == null)
            throw new BadRequestException("Doctor ID is required.");
        if (request.getAppointmentDate() == null)
            throw new BadRequestException("Appointment date is required.");
        if (request.getSlot() == null || request.getSlot().isEmpty())
            throw new BadRequestException("Slot is required.");

        DoctorResponse doctor;
        try {
            doctor = doctorClient.getDoctorById(request.getDoctorId());
        } catch (Exception e) {
            throw new ResourceNotFoundException("Doctor not found");
        }

        slotService.bookSlot(request.getDoctorId(), request.getAppointmentDate(), request.getSlot());

        appointment.setDoctorName(doctor.getName());
        appointment.setSpecialization(doctor.getSpecialization());
        appointment.setConsultationFee(
                doctor.getConsultationFee()
        );
        appointment.setStatus(AppointmentStatus.PENDING_PAYMENT);

        Appointment saved = appointmentRepository.save(appointment);

        // ── NOTIFICATION: Appointment booked ─────────────────────────────────
        try {

            // PATIENT NOTIFICATION
            NotificationEvent patientEvent =
                    new NotificationEvent(

                            "APPOINTMENT_BOOKED",

                            saved.getPatientId(),

                            null,

                            "📅 Appointment Booked",

                            "Your appointment with Dr. "
                                    + doctor.getName()
                                    + " on "
                                    + request.getAppointmentDate()
                                    + " at "
                                    + request.getSlot()
                                    + " is booked. Please complete payment to confirm."
                    );

            kafkaProducerService.sendNotification(
                    patientEvent
            );

            // DOCTOR NOTIFICATION
            NotificationEvent doctorEvent =
                    new NotificationEvent(

                            "NEW_APPOINTMENT_BOOKED",

                            null,

                            saved.getDoctorId(),

                            "New Appointment Booked",

                            "New appointment booked by "
                                    + saved.getPatientName()
                                    + " on "
                                    + request.getAppointmentDate()
                                    + " at "
                                    + request.getSlot()
                    );

            kafkaProducerService.sendNotification(
                    doctorEvent
            );

        } catch (Exception e) {

            log.error(
                    "Kafka notification failed for appointment booking",
                    e
            );
        }

        return saved;
    }

    // ─── GET BY ID ────────────────────────────────────────────────────────────
    public Appointment getAppointmentById(Long id) {

        String role = SecurityUtil.getLoggedInUserRole();
        String email = SecurityUtil.getLoggedInUserEmail();

        log.info("Get appointment by id={} role={}", id, role);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment with ID " + id + " does not exist."));

        if (role.equals("ROLE_ADMIN")
                || role.equals("ROLE_SUPER_ADMIN")
                || role.equals("ROLE_DOCTOR")) {
            return appointment;
        }

        PatientResponse patient = patientClient.getPatientByEmail(email);

        if (!appointment.getPatientId().equals(patient.getId())) {
            throw new AccessDeniedException("You can only view your own appointments.");
        }

        return appointment;
    }

    // ─── GET ALL ──────────────────────────────────────────────────────────────
    public List<Appointment> getAllAppointments() {

        String role = SecurityUtil.getLoggedInUserRole();
        log.info("Get all appointments role={}", role);

        if (!role.equals("ROLE_ADMIN") && !role.equals("ROLE_SUPER_ADMIN")) {
            throw new AccessDeniedException("Only admin can view all appointments.");
        }

        List<Appointment> list = appointmentRepository.findAll();


        return list;
    }

    // ─── GET BY PATIENT ───────────────────────────────────────────────────────
    public List<Appointment> getAppointmentsByPatient(Long patientId) {

        String role = SecurityUtil.getLoggedInUserRole();
        String email = SecurityUtil.getLoggedInUserEmail();

        log.info("Get appointments by patient={} role={}", patientId, role);

        if (role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN")) {
            List<Appointment> list = appointmentRepository.findByPatientId(patientId);
            if (list.isEmpty()) throw new ResourceNotFoundException("No appointments found.");
            return list;
        }

        PatientResponse patient = patientClient.getPatientByEmail(email);

        if (!patient.getId().equals(patientId)) {
            throw new AccessDeniedException("You can only view your own appointments.");
        }

        
        return appointmentRepository.findByPatientId(patient.getId());
    }

    // ─── GET BY DOCTOR ────────────────────────────────────────────────────────
    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {

        String role = SecurityUtil.getLoggedInUserRole();
        String email = SecurityUtil.getLoggedInUserEmail();

        log.info("Get appointments by doctor={} role={}", doctorId, role);

        if (role.equals("ROLE_ADMIN") || role.equals("ROLE_SUPER_ADMIN")) {
            List<Appointment> list = appointmentRepository.findByDoctorId(doctorId);
            if (list.isEmpty()) throw new ResourceNotFoundException("No appointments found.");
            return list;
        }

        if (role.equals("ROLE_DOCTOR")) {
            DoctorResponse doctor;
            try {
                doctor = doctorClient.getDoctorById(doctorId);
            } catch (Exception e) {
                throw new ResourceNotFoundException("Doctor not found.");
            }

            if (!doctor.getEmail().equals(email)) {
                throw new AccessDeniedException("You can only view your own appointments.");
            }

            List<Appointment> list = appointmentRepository.findByDoctorId(doctorId);
            return list;
        }

        throw new AccessDeniedException("Access denied.");
    }

    // ─── CANCEL APPOINTMENT ───────────────────────────────────────────────────
    @Transactional
    public Appointment cancelAppointment(Long id, String reason) {

        String role = SecurityUtil.getLoggedInUserRole();
        String email = SecurityUtil.getLoggedInUserEmail();

        Appointment appointment = getAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Already cancelled.");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel completed appointment.");
        }

        // REFUND CHECK BEFORE STATUS CHANGE
        boolean refundNeeded =
                appointment.getStatus()
                == AppointmentStatus.CONFIRMED;

        // PATIENT VALIDATION
        if (role.equals("ROLE_PATIENT")) {

            PatientResponse patient =
                    patientClient.getPatientByEmail(email);

            if (!appointment.getPatientId()
                    .equals(patient.getId())) {

                throw new AccessDeniedException(
                        "You can only cancel your own appointments."
                );
            }
        }

        // DOCTOR VALIDATION
        if (role.equals("ROLE_DOCTOR")) {

            DoctorResponse doctor =
                    doctorClient.getDoctorByEmail(email);

            if (!appointment.getDoctorId()
                    .equals(doctor.getId())) {

                throw new AccessDeniedException(
                        "You can only cancel your own appointments."
                );
            }
        }

        // CANCEL APPOINTMENT
        appointment.setStatus(
                AppointmentStatus.CANCELLED
        );

        appointment.setCancelReason(reason);

        appointment.setCancelledBy(role);

        appointment.setCancelledAt(
                LocalDateTime.now()
        );

        // RELEASE SLOT
        slotService.releaseSlot(
                appointment.getDoctorId(),
                appointment.getAppointmentDate(),
                appointment.getSlot()
        );

        Appointment saved =
                appointmentRepository.save(
                        appointment
                );

        // REFUND MESSAGE
        String refundMsg =
                refundNeeded
                        ? "Refund initiated."
                        : "Refund not applicable.";

        // NOTIFICATIONS
        try {

            // PATIENT CANCELLED
            if (role.equals("ROLE_PATIENT")) {

                // PATIENT
                NotificationEvent patientEvent =
                        new NotificationEvent(

                                "APPOINTMENT_CANCELLED",

                                saved.getPatientId(),

                                null,

                                "Appointment Cancelled",

                                "You cancelled your appointment with Dr. "
                                        + saved.getDoctorName()
                                        + " on "
                                        + saved.getAppointmentDate()
                                        + " at "
                                        + saved.getSlot()
                                        + ". Reason: "
                                        + reason
                                        + ". "
                                        + refundMsg
                        );

                kafkaProducerService.sendNotification(
                        patientEvent
                );

                // DOCTOR
                NotificationEvent doctorEvent =
                        new NotificationEvent(

                                "APPOINTMENT_CANCELLED_BY_PATIENT",

                                null,

                                saved.getDoctorId(),

                                "Appointment Cancelled By Patient",

                                saved.getPatientName()
                                        + " cancelled appointment on "
                                        + saved.getAppointmentDate()
                                        + " at "
                                        + saved.getSlot()
                                        + ". Reason: "
                                        + reason
                        );

                kafkaProducerService.sendNotification(
                        doctorEvent
                );
            }

            // DOCTOR CANCELLED
            else if (role.equals("ROLE_DOCTOR")) {

                // PATIENT
                NotificationEvent patientEvent =
                        new NotificationEvent(

                                "APPOINTMENT_CANCELLED_BY_DOCTOR",

                                saved.getPatientId(),

                                null,

                                "Appointment Cancelled",

                                "Dr. "
                                        + saved.getDoctorName()
                                        + " cancelled your appointment on "
                                        + saved.getAppointmentDate()
                                        + " at "
                                        + saved.getSlot()
                                        + ". Reason: "
                                        + reason
                                        + ". "
                                        + refundMsg
                        );

                kafkaProducerService.sendNotification(
                        patientEvent
                );
            }

            // ADMIN CANCELLED
            else if (
                    role.equals("ROLE_ADMIN")
                            || role.equals("ROLE_SUPER_ADMIN")
            ) {

                // PATIENT
                NotificationEvent patientEvent =
                        new NotificationEvent(

                                "APPOINTMENT_CANCELLED_BY_ADMIN",

                                saved.getPatientId(),

                                null,

                                "Appointment Cancelled By Admin",

                                "Your appointment with Dr. "
                                        + saved.getDoctorName()
                                        + " on "
                                        + saved.getAppointmentDate()
                                        + " was cancelled by admin. Reason: "
                                        + reason
                                        + ". "
                                        + refundMsg
                        );

                kafkaProducerService.sendNotification(
                        patientEvent
                );

                // DOCTOR
                NotificationEvent doctorEvent =
                        new NotificationEvent(

                                "APPOINTMENT_CANCELLED_BY_ADMIN",

                                null,

                                saved.getDoctorId(),

                                "Appointment Cancelled By Admin",

                                "Appointment with patient "
                                        + saved.getPatientName()
                                        + " on "
                                        + saved.getAppointmentDate()
                                        + " was cancelled by admin. Reason: "
                                        + reason
                        );

                kafkaProducerService.sendNotification(
                        doctorEvent
                );
            }

        } catch (Exception e) {

            log.error(
                    "Cancel notification failed",
                    e
            );
        }

        // REFUND AFTER NOTIFICATIONS
        if (refundNeeded) {

            try {

                paymentClient.refundPayment(
                        saved.getId()
                );

                saved.setRefundStatus(
                        "INITIATED"
                );

                appointmentRepository.save(saved);

            } catch (Exception e) {

                saved.setRefundStatus(
                        "FAILED"
                );

                appointmentRepository.save(saved);

                log.error(
                        "Refund failed",
                        e
                );
            }
        }

        return saved;
    }
    // ─── COMPLETE APPOINTMENT ─────────────────────────────────────────────────
    public Appointment completeAppointment(Long id) {

        Appointment appointment = getAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Already completed.");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cancelled cannot complete.");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        Appointment saved = appointmentRepository.save(appointment);

        // ── NOTIFICATION: Appointment completed ───────────────────────────────
		try {

			NotificationEvent event = new NotificationEvent(

					"APPOINTMENT_COMPLETED",

					saved.getPatientId(),

					null,

					"✅ Appointment Completed",

					"Your appointment with Dr. " + saved.getDoctorName() + " on " + saved.getAppointmentDate()
							+ " is completed. Please check your prescriptions.");

			kafkaProducerService.sendNotification(event);

		} catch (Exception e) {

			log.error("Notification failed for completeAppointment", e);
		}

        return saved;
    }

    // ─── MARK PAYMENT SUCCESS ─────────────────────────────────────────────────
    public Appointment markPaymentSuccess(Long id) {

        Appointment appt = getAppointmentById(id);

        
        if (appt.getStatus() == AppointmentStatus.CONFIRMED) {
            return appt;
        }

        if (appt.getStatus() == AppointmentStatus.COMPLETED) {
            return appt;
        }

        appt.setStatus(AppointmentStatus.CONFIRMED);

        Appointment saved = appointmentRepository.save(appt);

        // PATIENT NOTIFICATION
        try {

            NotificationEvent patientEvent =
                    new NotificationEvent(

                            "PAYMENT_CONFIRMED",

                            saved.getPatientId(),

                            null,

                            "Payment Confirmed",

                            "Payment for your appointment with Dr. "
                                    + saved.getDoctorName()
                                    + " on "
                                    + saved.getAppointmentDate()
                                    + " at "
                                    + saved.getSlot()
                                    + " is confirmed."
                    );

            kafkaProducerService.sendNotification(
                    patientEvent
            );

        } catch (Exception e) {

            log.error(
                    "Patient notification failed",
                    e
            );
        }

        // DOCTOR NOTIFICATION
        try {

            NotificationEvent event = new NotificationEvent(

                    "NEW_CONFIRMED_APPOINTMENT",

                    null,

                    saved.getDoctorId(),

                    "New Confirmed Appointment",

                    "Appointment with patient "
                            + saved.getPatientName()
                            + " on "
                            + saved.getAppointmentDate()
                            + " at "
                            + saved.getSlot()
                            + " has been confirmed."
            );

            kafkaProducerService.sendNotification(event);

        } catch (Exception e) {

            log.error("Doctor notification failed", e);
        }

        return saved;
    }
    public Appointment markRefundCompleted(Long id) {

        Appointment appt = getAppointmentById(id);

        appt.setRefundStatus("REFUNDED");

        Appointment saved = appointmentRepository.save(appt);

		try {

			NotificationEvent event = new NotificationEvent(

					"REFUND_COMPLETED",

					saved.getPatientId(),

					null,

					"Refund Completed",

					"Your refund for appointment with Dr. " + saved.getDoctorName()
							+ " has been completed successfully.");

			kafkaProducerService.sendNotification(event);

		} catch (Exception e) {

			log.error("Refund notification failed", e);
		}

        return saved;
    }
}