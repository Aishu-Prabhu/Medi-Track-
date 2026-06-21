package com.meditrack.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.meditrack.auth.entity.Role;
import com.meditrack.auth.entity.User;

public interface UserRepository  extends JpaRepository<User, Long>{
	Optional<User> findByEmail(String email); //used for login
	List<User> findByRole(Role role);
}
