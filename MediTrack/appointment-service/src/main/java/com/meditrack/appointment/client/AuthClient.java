package com.meditrack.appointment.client;

import com.meditrack.appointment.config.FeignConfig;
import com.meditrack.appointment.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auth-service", configuration = FeignConfig.class)  
public interface AuthClient {

    @GetMapping("/auth/user/email/{email}")
    UserResponse getUserByEmail(@PathVariable String email);
}