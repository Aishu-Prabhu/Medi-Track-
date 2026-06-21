package com.meditrack.prescription.client;

import com.meditrack.prescription.config.FeignConfig;
import com.meditrack.prescription.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
    name = "notification-service",
    configuration = FeignConfig.class
)
public interface NotificationClient {

    @PostMapping("/notifications/add")
    void create(@RequestBody NotificationRequest request);
}