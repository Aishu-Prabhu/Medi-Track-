package com.meditrack.appointment.service;

import com.meditrack.appointment.entity.DoctorSlot;
import com.meditrack.appointment.entity.SlotStatus;
import com.meditrack.appointment.exception.BadRequestException;
import com.meditrack.appointment.exception.ResourceNotFoundException;
import com.meditrack.appointment.exception.SlotAlreadyBookedException;
import com.meditrack.appointment.exception.SlotNotAvailableException;
import com.meditrack.appointment.repository.DoctorSlotRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlotServiceTest {

    @InjectMocks
    private SlotService service;

    @Mock
    private DoctorSlotRepository repo;

    private LocalDate today;
    private LocalDate futureDate; // ← always use this for booking tests

    @BeforeEach
    void setup() {
        today = LocalDate.now();
        futureDate = LocalDate.now().plusDays(1); // tomorrow — never hits time checks
    }

    // =========================
    // GENERATE SUCCESS
    // =========================
    @Test
    void testGenerateSlots_Success() {

        when(repo.findByDoctorIdAndSlotDate(1L, futureDate))
                .thenReturn(Collections.emptyList())
                .thenReturn(List.of(new DoctorSlot()));

        when(repo.save(any())).thenReturn(new DoctorSlot());

        List<DoctorSlot> result = service.generateSlots(1L, futureDate);

        assertNotNull(result);
        verify(repo, times(6)).save(any()); // 6 default slots
    }

    // =========================
    // GENERATE ALREADY EXISTS
    // =========================
    @Test
    void testGenerateSlots_AlreadyExists() {

        when(repo.findByDoctorIdAndSlotDate(1L, futureDate))
                .thenReturn(List.of(new DoctorSlot()));

        assertThrows(BadRequestException.class,
                () -> service.generateSlots(1L, futureDate));
    }

    // =========================
    // GENERATE PAST DATE
    // =========================
    @Test
    void testGenerateSlots_PastDate() {

        LocalDate pastDate = LocalDate.now().minusDays(1);

        assertThrows(BadRequestException.class,
                () -> service.generateSlots(1L, pastDate));
    }

    // =========================
    // GET ALL EMPTY
    // =========================
    @Test
    void testGetAllSlots_Empty() {

        // getAllSlots calls updateExpiredSlots first → findAll()
        when(repo.findAll()).thenReturn(Collections.emptyList());

        when(repo.findByDoctorIdAndSlotDate(1L, futureDate))
                .thenReturn(Collections.emptyList());

        assertThrows(ResourceNotFoundException.class,
                () -> service.getAllSlots(1L, futureDate));
    }

    // =========================
    // GET AVAILABLE EMPTY — all slots are BOOKED, none AVAILABLE
    // =========================
    @Test
    void testGetAvailableSlots_Empty() {

        // getAvailableSlots calls updateExpiredSlots first → findAll()
        when(repo.findAll()).thenReturn(Collections.emptyList());

        DoctorSlot booked = new DoctorSlot();
        booked.setStatus(SlotStatus.BOOKED);

        // Service calls findByDoctorIdAndSlotDate, then filters AVAILABLE in Java
        when(repo.findByDoctorIdAndSlotDate(1L, futureDate))
                .thenReturn(List.of(booked)); // slots exist but none available

        assertThrows(SlotNotAvailableException.class,
                () -> service.getAvailableSlots(1L, futureDate));
    }

    // =========================
    // BOOK SLOT NOT FOUND
    // =========================
    @Test
    void testBookSlot_NotFound() {

        // futureDate skips past-date and past-time checks completely
        when(repo.findByDoctorIdAndSlotDateAndSlotTime(
                1L, futureDate, "09:00 AM"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.bookSlot(1L, futureDate, "09:00 AM"));
    }

    // =========================
    // BOOK SLOT ALREADY BOOKED
    // =========================
    @Test
    void testBookSlot_AlreadyBooked() {

        DoctorSlot slot = new DoctorSlot();
        slot.setStatus(SlotStatus.BOOKED);

        when(repo.findByDoctorIdAndSlotDateAndSlotTime(
                1L, futureDate, "09:00 AM"))
                .thenReturn(Optional.of(slot));

        // SlotAlreadyBookedException extends BadRequestException in your code
        assertThrows(SlotAlreadyBookedException.class,
                () -> service.bookSlot(1L, futureDate, "09:00 AM"));
    }

    // =========================
    // BOOK SLOT INVALID TIME FORMAT
    // =========================
    @Test
    void testBookSlot_InvalidTimeFormat() {

        // today + invalid format → hits time parse → BadRequestException
        assertThrows(BadRequestException.class,
                () -> service.bookSlot(1L, today, "invalid-time"));
    }

    // =========================
    // BOOK SLOT SUCCESS
    // =========================
    @Test
    void testBookSlot_Success() {

        DoctorSlot slot = new DoctorSlot();
        slot.setStatus(SlotStatus.AVAILABLE);

        // futureDate — bypasses ALL date/time validation in bookSlot()
        when(repo.findByDoctorIdAndSlotDateAndSlotTime(
                1L, futureDate, "09:00 AM"))
                .thenReturn(Optional.of(slot));

        when(repo.save(any())).thenReturn(slot);

        DoctorSlot result = service.bookSlot(1L, futureDate, "09:00 AM");

        assertEquals(SlotStatus.BOOKED, result.getStatus());
        verify(repo).save(slot);
    }

    // =========================
    // RELEASE SLOT NOT FOUND
    // =========================
    @Test
    void testReleaseSlot_NotFound() {

        when(repo.findByDoctorIdAndSlotDateAndSlotTime(
                1L, futureDate, "09:00 AM"))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.releaseSlot(1L, futureDate, "09:00 AM"));
    }

    // =========================
    // RELEASE SLOT SUCCESS
    // =========================
    @Test
    void testReleaseSlot_Success() {

        DoctorSlot slot = new DoctorSlot();
        slot.setStatus(SlotStatus.BOOKED);

        when(repo.findByDoctorIdAndSlotDateAndSlotTime(
                1L, futureDate, "09:00 AM"))
                .thenReturn(Optional.of(slot));

        when(repo.save(any())).thenReturn(slot);

        DoctorSlot result = service.releaseSlot(1L, futureDate, "09:00 AM");

        assertEquals(SlotStatus.AVAILABLE, result.getStatus());
        verify(repo).save(slot);
    }
}