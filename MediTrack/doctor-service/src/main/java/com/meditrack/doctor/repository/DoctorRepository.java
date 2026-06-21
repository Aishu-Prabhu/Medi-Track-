package com.meditrack.doctor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meditrack.doctor.entity.Doctor;
import com.meditrack.doctor.entity.Specialization;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Doctor> findBySpecialization(Specialization specialization); 

    List<Doctor> findByAvailableTrue();
}