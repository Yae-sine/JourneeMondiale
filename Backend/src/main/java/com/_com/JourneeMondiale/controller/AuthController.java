package com._com.JourneeMondiale.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// import com._com.JourneeMondiale.model.ERole;
import com._com.JourneeMondiale.model.User;
import com._com.JourneeMondiale.payload.request.LoginRequest;
import com._com.JourneeMondiale.payload.request.SignupRequest;
import com._com.JourneeMondiale.payload.response.MessageResponse;
import com._com.JourneeMondiale.payload.response.UserInfoResponse;
import com._com.JourneeMondiale.repository.UserRepository;
import com._com.JourneeMondiale.security.Jwt.JwtUtils;
import com._com.JourneeMondiale.security.services.UserDetailsImpl;

import jakarta.validation.Valid;

// @CrossOrigin(origins = "*", maxAge = 3600 )
// for Angular Client (withCredentials)
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials="true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
  @Autowired
  AuthenticationManager authenticationManager;

  @Autowired
  UserRepository userRepository;

  @Autowired
  PasswordEncoder encoder;

  @Autowired
  JwtUtils jwtUtils;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

    Authentication authentication = authenticationManager
        .authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

    SecurityContextHolder.getContext().setAuthentication(authentication);

    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

    ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

    // Use single role
    String role = userDetails.getAuthorities().stream()
        .map(item -> item.getAuthority())
        .findFirst().orElse("");

    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
        .body(new UserInfoResponse(userDetails.getId(),
                                   userDetails.getUsername(),
                                   userDetails.getEmail(),
                                   role));
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@RequestBody SignupRequest signUpRequest) {
    if (userRepository.existsByUsername(signUpRequest.getUsername())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: Username is already taken!"));
    }

    if (userRepository.existsByEmail(signUpRequest.getEmail())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
    }

    // Create new user's account
    String role = "USER";
    if (signUpRequest.getRole() != null && !signUpRequest.getRole().isEmpty()) {
      String requestedRole = signUpRequest.getRole();
      if (requestedRole.equalsIgnoreCase("admin")) {
        role = "ADMIN";
      }
    }
    User user = new User(signUpRequest.getUsername(),
                         signUpRequest.getEmail(),signUpRequest.getFirstName(),
                         signUpRequest.getLastName(),
                         encoder.encode(signUpRequest.getPassword()),
                         role);

    userRepository.save(user);

    return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
  }

  @PostMapping("/signout")
  public ResponseEntity<?> logoutUser() {
    ResponseCookie cookie = jwtUtils.getCleanJwtCookie();
    return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(new MessageResponse("You've been signed out!"));
  }

  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
    if (userDetails == null) {
      return ResponseEntity.status(401).body(new MessageResponse("Unauthorized"));
    }
    String role = userDetails.getAuthorities().stream()
        .map(item -> item.getAuthority())
        .findFirst().orElse("");
    return ResponseEntity.ok(new UserInfoResponse(
      userDetails.getId(),
      userDetails.getUsername(),
      // you can add First name and last name if needed
      userDetails.getEmail(),
      role
    ));
  }
}
