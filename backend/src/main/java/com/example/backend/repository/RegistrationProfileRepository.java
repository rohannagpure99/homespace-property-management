
package com.example.backend.repository;

import com.example.backend.entity.RegistrationProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistrationProfileRepository
        extends JpaRepository<RegistrationProfile, Long> {

    Optional<RegistrationProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
