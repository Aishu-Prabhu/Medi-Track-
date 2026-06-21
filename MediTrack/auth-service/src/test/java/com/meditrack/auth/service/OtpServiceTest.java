package com.meditrack.auth.service;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OtpServiceTest {

    private OtpService otpService;

    @BeforeEach
    void setup() {
        otpService = new OtpService();
    }

    @Test
    void generateOtp_ShouldGenerateSixDigitOtp() {

        String otp = otpService.generateOtp("test@gmail.com");

        assertNotNull(otp);
        assertEquals(6, otp.length());
        assertFalse(otpService.isVerified("test@gmail.com"));
    }

    @Test
    void verifyOtp_ShouldReturnTrue_WhenCorrectOtp() {

        String otp = otpService.generateOtp("test@gmail.com");

        boolean result =
                otpService.verifyOtp("test@gmail.com", otp);

        assertTrue(result);
        assertTrue(
            otpService.isVerified("test@gmail.com")
        );
    }

    @Test
    void verifyOtp_ShouldReturnFalse_WhenWrongOtp() {

        otpService.generateOtp("test@gmail.com");

        boolean result =
                otpService.verifyOtp(
                        "test@gmail.com",
                        "999999"
                );

        assertFalse(result);
    }

    @Test
    void verifyOtp_ShouldReturnFalse_WhenOtpNotGenerated() {

        boolean result =
                otpService.verifyOtp(
                        "abc@gmail.com",
                        "123456"
                );

        assertFalse(result);
    }

    @Test
    void clear_ShouldRemoveAllStoredData() {

        String otp =
                otpService.generateOtp("test@gmail.com");

        otpService.verifyOtp("test@gmail.com", otp);

        otpService.clear("test@gmail.com");

        assertFalse(
            otpService.isVerified("test@gmail.com")
        );

        boolean result =
                otpService.verifyOtp(
                        "test@gmail.com",
                        otp
                );

        assertFalse(result);
    }
}