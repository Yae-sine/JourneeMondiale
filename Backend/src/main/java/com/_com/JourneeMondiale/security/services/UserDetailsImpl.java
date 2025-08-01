package com._com.JourneeMondiale.security.services;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.time.LocalDateTime;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com._com.JourneeMondiale.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

public class UserDetailsImpl implements UserDetails {
  private static final long serialVersionUID = 1L;

  final private Long id;

  final private String username;

  final private String email;

  final private String firstName;

  final private String lastName;

  @JsonIgnore
  final private String password;

  final private Collection<? extends GrantedAuthority> authorities;

  final private LocalDateTime createdAt;

  final private LocalDateTime updatedAt;

  public UserDetailsImpl(Long id, String username, String email, String firstName, String lastName, String password,
      Collection<? extends GrantedAuthority> authorities, LocalDateTime createdAt, LocalDateTime updatedAt) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.authorities = authorities;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static UserDetailsImpl build(User user) {
    // Ensure role has ROLE_ prefix for Spring Security
    String role = user.getRole();

    if (!role.startsWith("ROLE_")) {
      role = "ROLE_" + role;
    }
    
    List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));

    return new UserDetailsImpl(
        user.getId(), 
        user.getUsername(), 
        user.getEmail(),
        user.getFirstName(),
        user.getLastName(),
        user.getPassword(), 
        authorities,
        user.getCreatedAt(),
        user.getUpdatedAt());
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return authorities;
  }

  public Long getId() {
    return id;
  }

  public String getEmail() {
    return email;
  }

  public String getFirstName() {
    return firstName;
  }

  public String getLastName() {
    return lastName;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  @Override
  public String getPassword() {
    return password;
  }

  @Override
  public String getUsername() {
    return username;
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (o == null || getClass() != o.getClass())
      return false;
    UserDetailsImpl user = (UserDetailsImpl) o;
    return Objects.equals(id, user.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }
}