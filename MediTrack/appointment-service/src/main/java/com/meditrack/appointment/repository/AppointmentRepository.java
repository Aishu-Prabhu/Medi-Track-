package com.meditrack.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meditrack.appointment.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
	//Fetch appointments by patient Id
	List<Appointment> findByPatientId(Long patientId);
	
	//Fetch appointments by doctor Id
	List<Appointment> findByDoctorId(Long doctorId);

}
