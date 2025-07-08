package com._com.JourneeMondiale.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

@Entity
@Table(name = "users",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "username"),
           @UniqueConstraint(columnNames = "email")
       })
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  // @NotBlank
  private String firstName;

  // @NotBlank
  private String lastName;

  // @NotBlank
  @Size(max = 20)
  private String username;

  // @NotBlank
  @Size(max = 50)
  @Email
  private String email;

  // @NotBlank
  @Size(max = 120)
  private String password;

  //@ManyToMany(fetch = FetchType.LAZY)
  //@JoinTable(name = "user_roles", 
  //           joinColumns = @JoinColumn(name = "user_id"),
  //           inverseJoinColumns = @JoinColumn(name = "role_id"))
  //private Set<Role> roles = new HashSet<>();

  // Use a single role (enum) instead of a set
  private ERole role;

  public User(String username, String email, String firstName, String lastName, String password, ERole role) {
    this.username = username;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.password = password;
    this.role = role;
  }

  // Optionally, add a setter/getter for role if not using Lombok's @Data
  // public ERole getRole() { return role; }
  // public void setRole(ERole role) { this.role = role; }
}