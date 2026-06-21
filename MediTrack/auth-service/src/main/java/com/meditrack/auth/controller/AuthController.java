package com.meditrack.auth.controller;

import com.meditrack.auth.dto.AdminRegisterRequest;
import com.meditrack.auth.dto.DoctorRegisterRequest;
import com.meditrack.auth.dto.ForgotPasswordRequest;
import com.meditrack.auth.dto.LoginRequest;
import com.meditrack.auth.dto.RegisterRequest;
import com.meditrack.auth.dto.ResetForgotPasswordRequest;
import com.meditrack.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import com.meditrack.auth.dto.UserResponse;
import com.meditrack.auth.dto.VerifyOtpRequest;
import com.meditrack.auth.entity.User;
import com.meditrack.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Authentication APIs",description = "APIs for authentication, admin management, and password recovery")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;


    //REGISTER (PUBLIC → PATIENT)
    @Operation(summary = "Register a new patient account")
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    //LOGIN
    @Operation(summary = "Authenticate user and generate JWT token")
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                authService.login(request.getEmail(), request.getPassword())
        );
    }

    //CREATE DOCTOR (ADMIN ONLY)
    @Operation(summary = "Create doctor account by admin")
    @PostMapping("/admin/create-doctor")
    public ResponseEntity<?> createDoctor(
            @RequestHeader("Authorization") String header,
            @Valid @RequestBody DoctorRegisterRequest request) {

        String token = header.substring(7);
        return ResponseEntity.ok(authService.createDoctor(request, token));
    }
    //CREATE ADMIN 
    @Operation(summary = "Create admin account by superadmin")
    @PostMapping("/admin/create-admin")
    public ResponseEntity<?> createAdmin(
            @RequestHeader("Authorization") String header,
            @Valid @RequestBody AdminRegisterRequest request) {

        String token = header.substring(7);
        return ResponseEntity.ok(authService.createAdmin(request, token));
    }
    
    //email->Id
    @Operation(summary = "Get user details using email")
    @GetMapping("/user/email/{email}")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());

        return ResponseEntity.ok(response);
    }
    //get all admins
    @Operation(summary = "Get all admin accounts")
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllAdmins() {
        return ResponseEntity.ok(authService.getAllAdmins());
    }

    @Operation(summary = "Get admin details by ID")
    @GetMapping("/admin/{id}")
    public ResponseEntity<?> getAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(authService.getAdminById(id));
    }
    
    @Operation(summary = "Update admin details")
    @PutMapping("/admin/update-admin/{id}")
    public ResponseEntity<?> updateAdmin(
            @PathVariable Long id,
            @RequestBody AdminRegisterRequest request) {

        return ResponseEntity.ok(authService.updateAdmin(id, request));
    }
    
    @Operation(summary = "Delete admin account")
    @DeleteMapping("/admin/delete-admin/{id}")
    public ResponseEntity<?> deleteAdmin(
            @PathVariable Long id,
            @RequestHeader("Authorization") String header) {

        String token = header.substring(7);

        authService.deleteAdmin(id, token);

        return ResponseEntity.ok("Admin deleted successfully");
    }
    
    @Operation(summary = "Reset admin password")
    @PutMapping("/admin/reset-password/{id}")
    public ResponseEntity<?> resetPassword(
            @PathVariable Long id,
            @RequestParam String password) {

        return ResponseEntity.ok(authService.resetPassword(id, password));
    }
 // FORGOT PASSWORD - SEND OTP
    @Operation(summary = "Send OTP for forgot password")
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        return ResponseEntity.ok(
                authService.forgotPassword(request)
        );
    }


    // VERIFY OTP
    @Operation(summary = "Verify OTP for password reset")
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request) {

        return ResponseEntity.ok(
                authService.verifyOtp(request)
        );
    }


    // RESET PASSWORD AFTER OTP
    @Operation(summary = "Reset password using verified OTP")
    @PostMapping("/reset-forgot-password")
    public ResponseEntity<?> resetForgotPassword(
            @RequestBody ResetForgotPasswordRequest request) {

        return ResponseEntity.ok(
                authService.resetForgotPassword(request)
        );
    }
}