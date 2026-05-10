package com.operon.operon.repository;

import com.operon.operon.model.Role;
import com.operon.operon.model.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Long> {

    Optional<Worker> findByUsername(String username);
    Optional<Worker> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<Worker> findByRole(Role role);
    List<Worker> findByIsActive(Boolean isActive);
}
