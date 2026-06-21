package com.meditrack.auth.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.meditrack.auth.client.PatientClient;
import com.meditrack.auth.dto.AdminRegisterRequest;
import com.meditrack.auth.dto.AuthResponse;
import com.meditrack.auth.dto.DoctorRegisterRequest;
import com.meditrack.auth.dto.ForgotPasswordRequest;
import com.meditrack.auth.dto.PatientRequest;
import com.meditrack.auth.dto.RegisterRequest;
import com.meditrack.auth.dto.ResetForgotPasswordRequest;
import com.meditrack.auth.dto.VerifyOtpRequest;
import com.meditrack.auth.entity.Role;
import com.meditrack.auth.entity.User;
import com.meditrack.auth.exception.BadRequestException;
import com.meditrack.auth.exception.InvalidCredentialsException;
import com.meditrack.auth.exception.UnauthorizedException;
import com.meditrack.auth.exception.UserAlreadyExistsException;
import com.meditrack.auth.exception.UserNotFoundException;
import com.meditrack.auth.repository.UserRepository;
import com.meditrack.auth.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final PatientClient patientClient;
    private final OtpService otpService;
    private final EmailService emailService;

    

    // REGISTER (PATIENT)
    public User register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(
                "Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PATIENT);

        User savedUser = userRepository.save(user);

        patientClient.createPatient(
            new PatientRequest(
                request.getName(),
                request.getEmail(),
                request.getPhone(),
                request.getAge(),
                request.getBloodGroup(),
                request.getAddress(),
                "PATIENT"
            )
        );

        return savedUser;
    }

    // LOGIN
    public AuthResponse login(String email, String password) {

        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email cannot be empty");
        }

        if (password == null || password.isBlank()) {
            throw new BadRequestException("Password cannot be empty");
        }

        User user = userRepository.findByEmail(email)
            .orElseThrow(() ->
                new UserNotFoundException(
                    "No account found with email: " + email));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException(
                "Invalid email or password");
        }

        String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole().name()
        );

        return new AuthResponse(
            token,
            user.getEmail(),
            user.getRole().name()
        );
    }

    // CREATE DOCTOR (ADMIN + SUPER_ADMIN)
    public User createDoctor(DoctorRegisterRequest request, String token) {

        String role = jwtUtil.extractRole(token);

        if (!"ADMIN".equals(role) &&
            !"SUPER_ADMIN".equals(role)) {

            throw new UnauthorizedException(
                "Only ADMIN or SUPER_ADMIN can create doctors");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(
                "Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(
            passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.DOCTOR);

        return userRepository.save(user);
    }

    // CREATE ADMIN (SUPER_ADMIN ONLY)
    public User createAdmin(AdminRegisterRequest request, String token) {

        String role = jwtUtil.extractRole(token);

        if (!"SUPER_ADMIN".equals(role)) {
            throw new UnauthorizedException(
                "Only SUPER_ADMIN can create admins");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(
                "Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(
            passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ADMIN);

        return userRepository.save(user);
    }

    // VIEW ALL ADMINS (ADMIN + SUPER_ADMIN)
    public List<User> getAllAdmins() {
        return userRepository.findByRole(Role.ADMIN);
    }

    // VIEW ONE ADMIN
    public User getAdminById(Long id) {

        User user = userRepository.findById(id)
            .orElseThrow(() ->
                new UserNotFoundException(
                    "Admin not found with id: " + id));

        if (user.getRole() != Role.ADMIN &&
            user.getRole() != Role.SUPER_ADMIN) {

            throw new BadRequestException(
                "User is not an admin");
        }

        return user;
    }

    // UPDATE ADMIN
    public User updateAdmin(
            Long id,
            AdminRegisterRequest request) {

        User user = userRepository.findById(id)
            .orElseThrow(() ->
                new UserNotFoundException(
                    "Admin not found with id: " + id));

        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException(
                "Only ADMIN can be updated");
        }

        if (!user.getEmail().equals(request.getEmail()) &&
            userRepository.findByEmail(
                request.getEmail()).isPresent()) {

            throw new UserAlreadyExistsException(
                "Email already registered: " +
                request.getEmail());
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        if (request.getPassword() != null &&
            !request.getPassword().isBlank()) {

            user.setPassword(
                passwordEncoder.encode(
                    request.getPassword()));
        }

        return userRepository.save(user);
    }

 
 // DELETE ADMIN (PREVENT SELF DELETE + PREVENT SUPER_ADMIN DELETE)
    public void deleteAdmin(Long id, String token) {

        String email = jwtUtil.extractEmail(token);

        User currentUser = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "Logged in user not found"));

        User targetUser = userRepository
                .findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with id: " + id));

        // Prevent self delete
        if (currentUser.getId().equals(id)) {
            throw new BadRequestException(
                    "You cannot delete your own account");
        }

        // Prevent deleting SUPER_ADMIN
        if (targetUser.getRole() == Role.SUPER_ADMIN) {
            throw new UnauthorizedException(
                    "SUPER_ADMIN account cannot be deleted");
        }

        // Allow delete only ADMIN accounts
        if (targetUser.getRole() != Role.ADMIN) {
            throw new BadRequestException(
                    "Only ADMIN account can be deleted");
        }

        userRepository.delete(targetUser);
    }
    // RESET ADMIN PASSWORD
    public String resetPassword(
            Long id,
            String newPassword) {

        User user = userRepository.findById(id)
            .orElseThrow(() ->
                new UserNotFoundException(
                    "Admin not found with id: " + id));

        if (user.getRole() != Role.ADMIN) {
            throw new BadRequestException(
                "Only ADMIN password can be reset");
        }

        user.setPassword(
            passwordEncoder.encode(newPassword));

        userRepository.save(user);

        return "Password reset successfully";
    }
    
    //Forgot Password
    public String forgotPassword(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("Email not registered"));

        String otp = otpService.generateOtp(user.getEmail());

        emailService.sendOtp(user.getEmail(), otp);

        return "OTP sent to email successfully";
    }
    
    //Verify OTP
    public String verifyOtp(VerifyOtpRequest request) {

        boolean valid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp()
        );

        if (!valid) {
            throw new BadRequestException(
                    "Invalid or expired OTP");
        }

        return "OTP verified successfully";
    }
    //Reset Forgot Password
    public String resetForgotPassword(
            ResetForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        // MUST verify OTP first
        if (!otpService.isVerified(request.getEmail())) {
            throw new BadRequestException(
                    "OTP verification required");
        }

        // cannot reuse old password
        if (passwordEncoder.matches(
                request.getNewPassword(),
                user.getPassword())) {

            throw new BadRequestException(
                    "New password cannot be same as old password");
        }

        user.setPassword(
                passwordEncoder.encode(
                        request.getNewPassword()));

        userRepository.save(user);

        otpService.clear(request.getEmail());

        return "Password updated successfully";
    }
}