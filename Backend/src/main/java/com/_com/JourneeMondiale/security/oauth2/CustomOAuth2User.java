package com._com.JourneeMondiale.security.oauth2;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import com._com.JourneeMondiale.security.services.UserDetailsImpl;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {
    private final UserDetailsImpl userDetails;
    private final Map<String, Object> attributes;

    public CustomOAuth2User(UserDetailsImpl userDetails, Map<String, Object> attributes) {
        this.userDetails = userDetails;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + userDetails.getRole()));
    }

    @Override
    public String getName() {
        return userDetails.getUsername();
    }

    // Getters for UserDetailsImpl
    public UserDetailsImpl getUserDetails() {
        return userDetails;
    }

    public Long getId() {
        return userDetails.getId();
    }

    public String getEmail() {
        return userDetails.getEmail();
    }

    public String getUsername() {
        return userDetails.getUsername();
    }

    public String getFirstName() {
        return userDetails.getFirstName();
    }

    public String getLastName() {
        return userDetails.getLastName();
    }

    public String getRole() {
        return userDetails.getRole();
    }
}
