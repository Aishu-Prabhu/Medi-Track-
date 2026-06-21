package com.meditrack.auth.config;

import com.meditrack.auth.entity.Role;
import com.meditrack.auth.entity.User;
import com.meditrack.auth.repository.UserRepository;

import jakarta.annotation.PostConstruct;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Constructor Injection
    public AdminInitializer(UserRepository userRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void createDefaultAdmin() {

        String adminEmail = "admin@gmail.com";

        //Check if admin already exists
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            System.out.println("Admin already exists. Skipping creation.");
            return;
        }

        //Create Super admin
        User admin = new User();
        admin.setName("Super Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("admin123")); // change later
        admin.setRole(Role.SUPER_ADMIN);

        userRepository.save(admin);

        System.out.println("Default admin created successfully!");
    }
}