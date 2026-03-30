package com.metameds.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.metameds.backend.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    List<User> findByRole(String role);
}