package com.meditrack.appointment.repository;

import com.meditrack.appointment.entity.DoctorSlot;
import com.meditrack.appointment.entity.SlotStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DoctorSlotRepository extends JpaRepository<DoctorSlot, Long> {

    // All slots for a doctor on a date
    List<DoctorSlot> findByDoctorIdAndSlotDate(Long doctorId, LocalDate slotDate);

    // Slots filtered by status
    List<DoctorSlot> findByDoctorIdAndSlotDateAndStatus(
            Long doctorId, LocalDate slotDate, SlotStatus status);

    // Find specific slot with pessimistic lock to prevent double booking
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<DoctorSlot> findByDoctorIdAndSlotDateAndSlotTime(
            Long doctorId, LocalDate slotDate, String slotTime);
}