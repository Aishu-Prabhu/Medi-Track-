package com.meditrack.auth.service;

import com.meditrack.auth.client.PatientClient;
import com.meditrack.auth.dto.*;
import com.meditrack.auth.entity.Role;
import com.meditrack.auth.entity.User;
import com.meditrack.auth.repository.UserRepository;
import com.meditrack.auth.util.JwtUtil;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PatientClient patientClient;

    @Mock
    private OtpService otpService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private User user;
    private RegisterRequest request;

    @BeforeEach
    void setup() {

        user = new User();
        user.setId(1L);
        user.setName("Test");
        user.setEmail("test@gmail.com");
        user.setPassword("encoded123");
        user.setRole(Role.PATIENT);

        request = new RegisterRequest();
        request.setName("Test");
        request.setEmail("test@gmail.com");
        request.setPassword("test123");
        request.setPhone("9999999999");
        request.setAge(22);
        request.setBloodGroup("O+");
        request.setAddress("Bangalore");
    }

    @Test
    void registerSuccess() {

        when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("test123"))
                .thenReturn("encoded123");

        when(userRepository.save(any(User.class)))
                .thenReturn(user);

        User result = authService.register(request);

        assertNotNull(result);
        assertEquals("test@gmail.com", result.getEmail());

        verify(patientClient).createPatient(any());
    }

    @Test
    void registerEmailExists() {

        when(userRepository.findByEmail(request.getEmail()))
                .thenReturn(Optional.of(user));

        assertThrows(RuntimeException.class,
                () -> authService.register(request));
    }

    @Test
    void loginSuccess() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("test123", "encoded123"))
                .thenReturn(true);

        when(jwtUtil.generateToken(
                "test@gmail.com",
                "PATIENT"))
                .thenReturn("jwt-token");

        AuthResponse response =
                authService.login("test@gmail.com", "test123");

        assertEquals("jwt-token", response.getToken());
    }

    @Test
    void loginWrongPassword() {

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(any(), any()))
                .thenReturn(false);

        assertThrows(RuntimeException.class,
                () -> authService.login(
                        "test@gmail.com",
                        "wrong"));
    }

    @Test
    void forgotPasswordSuccess() {

        ForgotPasswordRequest req =
                new ForgotPasswordRequest();

        req.setEmail("test@gmail.com");

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(otpService.generateOtp("test@gmail.com"))
                .thenReturn("123456");

        String result =
                authService.forgotPassword(req);

        assertEquals(
                "OTP sent to email successfully",
                result);

        verify(emailService)
                .sendOtp("test@gmail.com", "123456");
    }

    @Test
    void verifyOtpSuccess() {

        VerifyOtpRequest req =
                new VerifyOtpRequest();

        req.setEmail("test@gmail.com");
        req.setOtp("123456");

        when(otpService.verifyOtp(
                "test@gmail.com",
                "123456"))
                .thenReturn(true);

        String result =
                authService.verifyOtp(req);

        assertEquals(
                "OTP verified successfully",
                result);
    }

    @Test
    void resetForgotPasswordSuccess() {

        ResetForgotPasswordRequest req =
                new ResetForgotPasswordRequest();

        req.setEmail("test@gmail.com");
        req.setNewPassword("new123");

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        when(otpService.isVerified("test@gmail.com"))
                .thenReturn(true);

        when(passwordEncoder.matches(
                "new123",
                "encoded123"))
                .thenReturn(false);

        when(passwordEncoder.encode("new123"))
                .thenReturn("newEncoded");

        String result =
                authService.resetForgotPassword(req);

        assertEquals(
                "Password updated successfully",
                result);

        verify(otpService)
                .clear("test@gmail.com");
    }

 @Test
 void createDoctorByAdminSuccess() {

     DoctorRegisterRequest req =
             new DoctorRegisterRequest();

     req.setName("Doctor");
     req.setEmail("doc@gmail.com");
     req.setPassword("123");

     User saved = new User();
     saved.setRole(Role.DOCTOR);

     when(jwtUtil.extractRole("token"))
             .thenReturn("ADMIN");

     when(userRepository.findByEmail("doc@gmail.com"))
             .thenReturn(Optional.empty());

     when(passwordEncoder.encode("123"))
             .thenReturn("enc");

     when(userRepository.save(any(User.class)))
             .thenReturn(saved);

     User result =
             authService.createDoctor(req, "token");

     assertEquals(Role.DOCTOR, result.getRole());
 }

 @Test
 void createDoctorUnauthorized() {

     DoctorRegisterRequest req =
             new DoctorRegisterRequest();

     when(jwtUtil.extractRole("token"))
             .thenReturn("PATIENT");

     assertThrows(RuntimeException.class,
             () -> authService.createDoctor(req, "token"));
 }

 @Test
 void createAdminSuccess() {

     AdminRegisterRequest req =
             new AdminRegisterRequest();

     req.setName("Admin");
     req.setEmail("admin@gmail.com");
     req.setPassword("123");

     User saved = new User();
     saved.setRole(Role.ADMIN);

     when(jwtUtil.extractRole("token"))
             .thenReturn("SUPER_ADMIN");

     when(userRepository.findByEmail("admin@gmail.com"))
             .thenReturn(Optional.empty());

     when(passwordEncoder.encode("123"))
             .thenReturn("enc");

     when(userRepository.save(any(User.class)))
             .thenReturn(saved);

     User result =
             authService.createAdmin(req, "token");

     assertEquals(Role.ADMIN, result.getRole());
 }

 @Test
 void createAdminUnauthorized() {

     AdminRegisterRequest req =
             new AdminRegisterRequest();

     when(jwtUtil.extractRole("token"))
             .thenReturn("ADMIN");

     assertThrows(RuntimeException.class,
             () -> authService.createAdmin(req, "token"));
 }

 @Test
 void getAllAdminsSuccess() {

     when(userRepository.findByRole(Role.ADMIN))
             .thenReturn(java.util.List.of(new User()));

     assertEquals(1,
             authService.getAllAdmins().size());
 }

 @Test
 void getAdminByIdSuccess() {

     User admin = new User();
     admin.setRole(Role.ADMIN);

     when(userRepository.findById(1L))
             .thenReturn(Optional.of(admin));

     assertNotNull(
             authService.getAdminById(1L));
 }

 @Test
 void getAdminByIdWrongRole() {

     User doctor = new User();
     doctor.setRole(Role.DOCTOR);

     when(userRepository.findById(1L))
             .thenReturn(Optional.of(doctor));

     assertThrows(RuntimeException.class,
             () -> authService.getAdminById(1L));
 }

 @Test
 void updateAdminSuccess() {

     User admin = new User();
     admin.setRole(Role.ADMIN);
     admin.setEmail("old@gmail.com");

     AdminRegisterRequest req =
             new AdminRegisterRequest();

     req.setName("New");
     req.setEmail("new@gmail.com");
     req.setPassword("123");

     when(userRepository.findById(1L))
             .thenReturn(Optional.of(admin));

     when(userRepository.findByEmail("new@gmail.com"))
             .thenReturn(Optional.empty());

     when(passwordEncoder.encode("123"))
             .thenReturn("enc");

     when(userRepository.save(any()))
             .thenReturn(admin);

     assertNotNull(
             authService.updateAdmin(1L, req));
 }

 @Test
 void deleteAdminSuccess() {

     User current = new User();
     current.setId(10L);

     User target = new User();
     target.setId(1L);
     target.setRole(Role.ADMIN);

     when(jwtUtil.extractEmail("token"))
             .thenReturn("me@gmail.com");

     when(userRepository.findByEmail("me@gmail.com"))
             .thenReturn(Optional.of(current));

     when(userRepository.findById(1L))
             .thenReturn(Optional.of(target));

     authService.deleteAdmin(1L, "token");

     verify(userRepository).delete(target);
 }

 @Test
 void deleteAdminSelfDeleteBlocked() {

     User current = new User();
     current.setId(1L);

     when(jwtUtil.extractEmail("token"))
             .thenReturn("me@gmail.com");

     when(userRepository.findByEmail("me@gmail.com"))
             .thenReturn(Optional.of(current));

     when(userRepository.findById(1L))
             .thenReturn(Optional.of(current));

     assertThrows(RuntimeException.class,
             () -> authService.deleteAdmin(1L, "token"));
 }

 @Test
 void resetPasswordSuccess() {

     User admin = new User();
     admin.setRole(Role.ADMIN);

     when(userRepository.findById(1L))
             .thenReturn(Optional.of(admin));

     when(passwordEncoder.encode("123"))
             .thenReturn("enc");

     String result =
             authService.resetPassword(1L, "123");

     assertEquals(
             "Password reset successfully",
             result);
 }

 @Test
 void forgotPasswordUserNotFound() {

     ForgotPasswordRequest req =
             new ForgotPasswordRequest();

     req.setEmail("x@gmail.com");

     when(userRepository.findByEmail("x@gmail.com"))
             .thenReturn(Optional.empty());

     assertThrows(RuntimeException.class,
             () -> authService.forgotPassword(req));
 }

 @Test
 void verifyOtpInvalid() {

     VerifyOtpRequest req =
             new VerifyOtpRequest();

     req.setEmail("test@gmail.com");
     req.setOtp("999");

     when(otpService.verifyOtp(
             "test@gmail.com",
             "999"))
             .thenReturn(false);

     assertThrows(RuntimeException.class,
             () -> authService.verifyOtp(req));
 }

 @Test
 void resetForgotPasswordOtpNotVerified() {

     ResetForgotPasswordRequest req =
             new ResetForgotPasswordRequest();

     req.setEmail("test@gmail.com");
     req.setNewPassword("new123");

     when(userRepository.findByEmail("test@gmail.com"))
             .thenReturn(Optional.of(user));

     when(otpService.isVerified("test@gmail.com"))
             .thenReturn(false);

     assertThrows(RuntimeException.class,
             () -> authService.resetForgotPassword(req));
 }
}