package com._com.JourneeMondiale.payload.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UserInfoResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public UserInfoResponse(Long id, String username, String email, String role, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}