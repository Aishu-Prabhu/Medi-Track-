package com.meditrack.payment.controller;

import com.meditrack.payment.dto.PaymentRequest;
import com.meditrack.payment.dto.PaymentVerifyRequest;
import com.meditrack.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService service;

    @PostMapping("/create")
    public ResponseEntity<?> create(@Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(
                service.createPayment(req.getAppointmentId(), req.getAmount()));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(
            @RequestBody PaymentVerifyRequest req){
    	return ResponseEntity.ok(service.verifyPayment(req.getOrderId(), req.getPaymentId(), req.getSignature()));
    }
}