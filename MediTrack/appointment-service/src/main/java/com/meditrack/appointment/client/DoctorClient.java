package com.meditrack.appointment.client;

import com.meditrack.appointment.config.FeignConfig;
import com.meditrack.appointment.dto.DoctorResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "doctor-service", configuration = FeignConfig.class)
public interface DoctorClient {

	//Get doctor by id
    @GetMapping("/doctors/{id}")
    DoctorResponse getDoctorById(@PathVariable Long id);
    
    //Toggle availability
    @PutMapping("/doctors/toggle-availability/{id}")
    DoctorResponse toggleAvailability(@PathVariable Long id);
    
    @GetMapping("/doctors/email/{email}")
    DoctorResponse getDoctorByEmail(@PathVariable String email);
}