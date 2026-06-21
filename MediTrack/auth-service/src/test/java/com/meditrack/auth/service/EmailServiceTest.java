package com.meditrack.auth.service;

import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

class EmailServiceTest {

    @Mock
    private JavaMailSender sender;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void sendOtp_ShouldSendMailSuccessfully() {

        emailService.sendOtp("test@gmail.com", "123456");

        ArgumentCaptor<SimpleMailMessage> captor =
                ArgumentCaptor.forClass(SimpleMailMessage.class);

        verify(sender).send(captor.capture());

        SimpleMailMessage mail = captor.getValue();

        assert mail.getTo()[0].equals("test@gmail.com");
        assert mail.getSubject().equals("MediTrack Password Reset OTP");
        assert mail.getText().equals("Your OTP is: 123456");
    }
}