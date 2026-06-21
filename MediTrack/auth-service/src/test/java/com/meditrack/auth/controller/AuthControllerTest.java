package com.meditrack.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meditrack.auth.dto.*;
import com.meditrack.auth.entity.Role;
import com.meditrack.auth.entity.User;
import com.meditrack.auth.repository.UserRepository;
import com.meditrack.auth.service.AuthService;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    MockMvc mockMvc;

    @Autowired
    ObjectMapper objectMapper;

    @MockBean
    AuthService authService;

    @MockBean
    UserRepository userRepository;

    // ===========================
    // REGISTER
    // ===========================
    @Test
    void registerSuccess() throws Exception {

        User user = new User();
        user.setEmail("test@gmail.com");

        when(authService.register(any()))
                .thenReturn(user);

        RegisterRequest req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@gmail.com");
        req.setPassword("test123");
        req.setPhone("9999999999");
        req.setAge(22);
        req.setBloodGroup("O+");
        req.setAddress("Bangalore");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ===========================
    // LOGIN
    // ===========================
    @Test
    void loginSuccess() throws Exception {

        when(authService.login("test@gmail.com", "test123"))
                .thenReturn(
                        new AuthResponse(
                                "token",
                                "test@gmail.com",
                                "PATIENT"));

        LoginRequest req = new LoginRequest();
        req.setEmail("test@gmail.com");
        req.setPassword("test123");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"));
    }

    // ===========================
    // CREATE DOCTOR
    // ===========================
    @Test
    void createDoctorSuccess() throws Exception {

        User user = new User();
        user.setRole(Role.DOCTOR);

        when(authService.createDoctor(any(), any()))
                .thenReturn(user);

        DoctorRegisterRequest req =
                new DoctorRegisterRequest();

        req.setName("Doctor John");
        req.setEmail("doc@gmail.com");
        req.setPassword("doc123");

        mockMvc.perform(post("/auth/admin/create-doctor")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ===========================
    // CREATE ADMIN
    // ===========================
    @Test
    void createAdminSuccess() throws Exception {

        User user = new User();
        user.setRole(Role.ADMIN);

        when(authService.createAdmin(any(), any()))
                .thenReturn(user);

        AdminRegisterRequest req =
                new AdminRegisterRequest();

        req.setName("Admin User");
        req.setEmail("admin@gmail.com");
        req.setPassword("admin123");

        mockMvc.perform(post("/auth/admin/create-admin")
                .header("Authorization", "Bearer token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ===========================
    // GET USER BY EMAIL
    // ===========================
    @Test
    void getUserByEmailSuccess() throws Exception {

        User user = new User();
        user.setId(1L);
        user.setEmail("test@gmail.com");

        when(userRepository.findByEmail("test@gmail.com"))
                .thenReturn(Optional.of(user));

        mockMvc.perform(get("/auth/user/email/test@gmail.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    // ===========================
    // GET ALL ADMINS
    // ===========================
    @Test
    void getAllAdminsSuccess() throws Exception {

        when(authService.getAllAdmins())
                .thenReturn(List.of(new User()));

        mockMvc.perform(get("/auth/admin/all"))
                .andExpect(status().isOk());
    }

    // ===========================
    // GET ADMIN BY ID
    // ===========================
    @Test
    void getAdminByIdSuccess() throws Exception {

        when(authService.getAdminById(1L))
                .thenReturn(new User());

        mockMvc.perform(get("/auth/admin/1"))
                .andExpect(status().isOk());
    }

    // ===========================
    // UPDATE ADMIN
    // ===========================
    @Test
    void updateAdminSuccess() throws Exception {

        when(authService.updateAdmin(anyLong(), any()))
                .thenReturn(new User());

        AdminRegisterRequest req =
                new AdminRegisterRequest();

        req.setName("Updated User");
        req.setEmail("updated@gmail.com");
        req.setPassword("update123");

        mockMvc.perform(put("/auth/admin/update-admin/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ===========================
    // DELETE ADMIN
    // ===========================
    @Test
    void deleteAdminSuccess() throws Exception {

        mockMvc.perform(delete("/auth/admin/delete-admin/1")
                .header("Authorization", "Bearer token"))
                .andExpect(status().isOk());
    }

    // ===========================
    // RESET PASSWORD
    // ===========================
    @Test
    void resetPasswordSuccess() throws Exception {

        when(authService.resetPassword(1L, "test123"))
                .thenReturn("done");

        mockMvc.perform(put("/auth/admin/reset-password/1")
                .param("password", "test123"))
                .andExpect(status().isOk());
    }

    // ===========================
    // FORGOT PASSWORD
    // ===========================
    @Test
    void forgotPasswordSuccess() throws Exception {

        when(authService.forgotPassword(any()))
                .thenReturn("OTP sent");

        ForgotPasswordRequest req =
                new ForgotPasswordRequest();

        req.setEmail("test@gmail.com");

        mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ===========================
    // VERIFY OTP
    // ===========================
    @Test
    void verifyOtpSuccess() throws Exception {

        when(authService.verifyOtp(any()))
                .thenReturn("verified");

        VerifyOtpRequest req =
                new VerifyOtpRequest();

        req.setEmail("test@gmail.com");
        req.setOtp("123456");

        mockMvc.perform(post("/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    // ===========================
    // RESET FORGOT PASSWORD
    // ===========================
    @Test
    void resetForgotPasswordSuccess() throws Exception {

        when(authService.resetForgotPassword(any()))
                .thenReturn("updated");

        ResetForgotPasswordRequest req =
                new ResetForgotPasswordRequest();

        req.setEmail("test@gmail.com");
        req.setNewPassword("new123");

        mockMvc.perform(post("/auth/reset-forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}