package com._com.JourneeMondiale.service;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com._com.JourneeMondiale.model.User;
import com._com.JourneeMondiale.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id); // This will throw if not found
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        
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
}

