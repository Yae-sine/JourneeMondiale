package com._com.JourneeMondiale.repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com._com.JourneeMondiale.model.User;

@Repository
public interface  UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByUsernameAndEmail(String username, String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
    
    // LinkedIn OAuth2 methods
    Optional<User> findByLinkedinId(String linkedinId);
    Boolean existsByLinkedinId(String linkedinId);
}
