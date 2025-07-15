package com._com.JourneeMondiale.service;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com._com.JourneeMondiale.model.User;
import com._com.JourneeMondiale.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User createUser(User user) {
        // Hash the password before saving
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id); // This will throw if not found
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setRole(userDetails.getRole());
        
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public List<User> searchUsers(String searchTerm, String role) {
        List<User> users = userRepository.findAll();
        
        return users.stream()
                .filter(user -> {
                    // Filter by search term
                    boolean matchesSearch = searchTerm == null || searchTerm.trim().isEmpty() ||
                            user.getUsername().toLowerCase().contains(searchTerm.toLowerCase()) ||
                            user.getEmail().toLowerCase().contains(searchTerm.toLowerCase()) ||
                            (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(searchTerm.toLowerCase())) ||
                            (user.getLastName() != null && user.getLastName().toLowerCase().contains(searchTerm.toLowerCase()));
                    
                    // Filter by role
                    boolean matchesRole = role == null || role.trim().isEmpty() || 
                            user.getRole().equals(role);
                    
                    return matchesSearch && matchesRole;
                })
                .collect(Collectors.toList());
    }

    // New methods for current user profile management
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public User updateUserProfile(String username, User userDetails) {
        User user = getUserByUsername(username);
        
        // Update only allowed fields (not role or password)
        if (userDetails.getFirstName() != null) {
            user.setFirstName(userDetails.getFirstName());
        }
        if (userDetails.getLastName() != null) {
            user.setLastName(userDetails.getLastName());
        }
        if (userDetails.getEmail() != null) {
            user.setEmail(userDetails.getEmail());
        }
        if (userDetails.getUsername() != null) {
            user.setUsername(userDetails.getUsername());
        }
        return userRepository.save(user);
    }

    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = getUserByUsername(username);
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        
        // Hash and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}

