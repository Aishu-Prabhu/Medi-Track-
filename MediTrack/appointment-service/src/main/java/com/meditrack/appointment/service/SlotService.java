package com.meditrack.appointment.service;

import com.meditrack.appointment.entity.DoctorSlot;
import com.meditrack.appointment.entity.SlotStatus;
import com.meditrack.appointment.exception.BadRequestException;
import com.meditrack.appointment.exception.ResourceNotFoundException;
import com.meditrack.appointment.exception.SlotAlreadyBookedException;
import com.meditrack.appointment.exception.SlotNotAvailableException;
import com.meditrack.appointment.repository.DoctorSlotRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class SlotService {

    private static final Logger log = LoggerFactory.getLogger(SlotService.class);

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private static final List<String> DEFAULT_SLOTS = Arrays.asList(
        "09:00 AM", "10:00 AM", "11:00 AM",
        "02:00 PM", "03:00 PM", "04:00 PM"
    );

    private final DoctorSlotRepository slotRepository;

    public SlotService(DoctorSlotRepository slotRepository) {
        this.slotRepository = slotRepository;
    }

    // =========================
    // EXPIRE HELPER — public so @Transactional works via Spring AOP
    // =========================
    @Transactional
    public void updateExpiredSlots() {

        LocalDate today = ZonedDateTime.now(IST).toLocalDate();
        LocalTime currentTime = ZonedDateTime.now(IST).toLocalTime();

        log.info("Checking expired slots. Today={} CurrentTime(IST)={}", today, currentTime);

        List<DoctorSlot> allSlots = slotRepository.findAll();

        for (DoctorSlot slot : allSlots) {

            if (slot.getStatus() != SlotStatus.AVAILABLE) continue;

            try {
                // Parse "09:00 AM" / "02:00 PM" into LocalTime for proper comparison
                LocalTime slotTime = LocalTime.parse(slot.getSlotTime(), TIME_FORMAT);

                boolean isPastDate = slot.getSlotDate().isBefore(today);
                boolean isTodayPastTime = slot.getSlotDate().equals(today)
                                          && slotTime.isBefore(currentTime);

                if (isPastDate || isTodayPastTime) {
                    log.info("Expiring slot id={} time={} slotTime(parsed)={}",
                             slot.getId(), slot.getSlotTime(), slotTime);
                    slot.setStatus(SlotStatus.EXPIRED);
                    slotRepository.save(slot);
                }

            } catch (Exception e) {
                log.error("Failed to parse slot time '{}' for slot id={}",
                          slot.getSlotTime(), slot.getId());
            }
        }
    }

    // =========================
    // GENERATE SLOTS
    // =========================
    public List<DoctorSlot> generateSlots(Long doctorId, LocalDate date) {

        log.info("Generating slots for doctorId={} on date={}", doctorId, date);

        LocalDate today = ZonedDateTime.now(IST).toLocalDate();

        if (date.isBefore(today)) {
            throw new BadRequestException("Cannot generate slots for past dates.");
        }

        if (date.isAfter(today.plusDays(30))) {
            throw new BadRequestException("Slots can only be generated within next 30 days.");
        }

        List<DoctorSlot> existing =
                slotRepository.findByDoctorIdAndSlotDate(doctorId, date);

        if (!existing.isEmpty()) {
            throw new BadRequestException(
                    "Slots already exist for doctor " + doctorId + " on " + date);
        }

        for (String time : DEFAULT_SLOTS) {
            DoctorSlot slot = new DoctorSlot();
            slot.setDoctorId(doctorId);
            slot.setSlotDate(date);
            slot.setSlotTime(time);
            slot.setStatus(SlotStatus.AVAILABLE);
            slotRepository.save(slot);
        }

        return slotRepository.findByDoctorIdAndSlotDate(doctorId, date);
    }

    // =========================
    // GET ALL SLOTS
    // =========================
    public List<DoctorSlot> getAllSlots(Long doctorId, LocalDate date) {

        updateExpiredSlots(); 

        List<DoctorSlot> slots =
                slotRepository.findByDoctorIdAndSlotDate(doctorId, date);

        if (slots.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No slots found for doctor " + doctorId + " on " + date);
        }

        return slots;
    }

    // =========================
    // GET AVAILABLE SLOTS
    // =========================
    public List<DoctorSlot> getAvailableSlots(Long doctorId, LocalDate date) {

        updateExpiredSlots(); 

        List<DoctorSlot> slots =
                slotRepository.findByDoctorIdAndSlotDate(doctorId, date);

        if (slots.isEmpty()) {
            throw new SlotNotAvailableException(
                    "No slots found for doctor " + doctorId + " on " + date);
        }

        List<DoctorSlot> availableSlots = slots.stream()
                .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                .toList();

        if (availableSlots.isEmpty()) {
            throw new SlotNotAvailableException(
                    "All slots for today have already passed or booked.");
        }

        return availableSlots;
    }

    // =========================
    // BOOK SLOT
    // =========================
    @Transactional
    public DoctorSlot bookSlot(Long doctorId, LocalDate date, String slotTime) {

        log.info("Booking slot={} doctorId={} date={}", slotTime, doctorId, date);

        LocalDate today = ZonedDateTime.now(IST).toLocalDate();
        LocalTime currentTime = ZonedDateTime.now(IST).toLocalTime();

        if (date.isBefore(today)) {
            throw new BadRequestException("Cannot book slots for past dates.");
        }

        if (date.equals(today)) {
            try {
                LocalTime requestedTime = LocalTime.parse(slotTime, TIME_FORMAT);
                if (requestedTime.isBefore(currentTime)) {
                    throw new BadRequestException("Cannot book past time slots for today.");
                }
            } catch (BadRequestException e) {
                throw e;
            } catch (Exception e) {
                throw new BadRequestException(
                        "Invalid slot time format. Expected: hh:mm AM/PM");
            }
        }

        DoctorSlot slot = slotRepository
                .findByDoctorIdAndSlotDateAndSlotTime(doctorId, date, slotTime)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Slot " + slotTime + " does not exist for doctor " + doctorId));

        if (slot.getStatus() == SlotStatus.BOOKED) {
            throw new SlotAlreadyBookedException("Slot " + slotTime + " is already booked");
        }

        if (slot.getStatus() == SlotStatus.EXPIRED) {
            throw new BadRequestException("Cannot book expired slot " + slotTime);
        }

        slot.setStatus(SlotStatus.BOOKED);
        return slotRepository.save(slot);
    }

    // =========================
    // RELEASE SLOT
    // =========================
    public DoctorSlot releaseSlot(Long doctorId, LocalDate date, String slotTime) {

        DoctorSlot slot = slotRepository
                .findByDoctorIdAndSlotDateAndSlotTime(doctorId, date, slotTime)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Slot " + slotTime + " not found for doctor " + doctorId));

        slot.setStatus(SlotStatus.AVAILABLE);
        return slotRepository.save(slot);
    }

    
    
    
    @Scheduled(fixedRate = 60000)
    public void expirePastSlots() {
        log.info("Running scheduled slot expiration job...");
        updateExpiredSlots();
    }
}