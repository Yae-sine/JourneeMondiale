package com._com.JourneeMondiale.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.model.User;
import com._com.JourneeMondiale.payload.request.LoginRequest;
import com._com.JourneeMondiale.payload.request.SignupRequest;
import com._com.JourneeMondiale.payload.response.MessageResponse;
import com._com.JourneeMondiale.payload.response.UserInfoResponse;
import com._com.JourneeMondiale.repository.UserRepository;
import com._com.JourneeMondiale.security.Jwt.JwtUtils;
import com._com.JourneeMondiale.security.oauth2.CustomOAuth2User;
import com._com.JourneeMondiale.security.services.UserDetailsImpl;
import com._com.JourneeMondiale.service.LinkedInService;

import jakarta.validation.Valid;
import reactor.core.publisher.Mono;

// @CrossOrigin(origins = "*", maxAge = 3600 )
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

  @Autowired
  LinkedInService linkedInService;

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
                                   userDetails.getFirstName(),
                                   userDetails.getLastName(),
                                   role,
                                   userDetails.getCreatedAt(),
                                   userDetails.getUpdatedAt()));
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
      userDetails.getEmail(),
      userDetails.getFirstName(),
      userDetails.getLastName(),
      role,
      userDetails.getCreatedAt(),
      userDetails.getUpdatedAt()
    ));
  }

  @GetMapping("/oauth2/success")
  public ResponseEntity<?> oauth2Success(Authentication authentication) {
    try {
      Object principal = authentication.getPrincipal();
      UserDetailsImpl userDetails;
      
      if (principal instanceof CustomOAuth2User) {
        CustomOAuth2User oauth2User = (CustomOAuth2User) principal;
        userDetails = oauth2User.getUserDetails();
      } else if (principal instanceof UserDetailsImpl) {
        userDetails = (UserDetailsImpl) principal;
      } else {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new MessageResponse("Invalid authentication principal"));
      }

      // Generate JWT cookie for the OAuth2 user
      ResponseCookie jwtCookie = jwtUtils.generateJwtCookie(userDetails);

      String role = userDetails.getAuthorities().stream()
          .map(item -> item.getAuthority())
          .findFirst().orElse("ROLE_USER");

      return ResponseEntity.ok()
          .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
          .body(new UserInfoResponse(
              userDetails.getId(),
              userDetails.getUsername(),
              userDetails.getEmail(),
              userDetails.getFirstName(),
              userDetails.getLastName(),
              role,
              userDetails.getCreatedAt(),
              userDetails.getUpdatedAt()
          ));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new MessageResponse("OAuth2 authentication failed: " + e.getMessage()));
    }
  }

  @GetMapping("/oauth2/failure")
  public ResponseEntity<?> oauth2Failure() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
        .body(new MessageResponse("OAuth2 authentication failed"));
  }

  @PostMapping("/linkedin/share-text")
  public Mono<ResponseEntity<?>> shareTextPost(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @RequestParam String text) {
    
    if (userDetails == null) {
      return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new MessageResponse("Unauthorized")));
    }

    // Get user from database to access LinkedIn token
    return Mono.fromCallable(() -> {
    User user = userRepository.findById(userDetails.getId())
        .orElseThrow(() -> new RuntimeException("User not found"));
    
      if (user.getLinkedinAccessToken() == null || user.getLinkedinId() == null) {
        throw new RuntimeException("User not connected to LinkedIn");
      }
  
    return user;
    }).flatMap(user -> 
      linkedInService.shareTextPost(user.getLinkedinAccessToken(), user.getLinkedinId(), text)
    ).map(response -> 
      ResponseEntity.ok(response) // Transform JsonNode into ResponseEntity<?>
    );
  }

  @PostMapping("/linkedin/share-image")
  public Mono<ResponseEntity<?>> shareImagePost(
      @AuthenticationPrincipal UserDetailsImpl userDetails,
      @RequestParam String text,
      @RequestParam String imageUrl) {
    
    if (userDetails == null) {
      return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new MessageResponse("Unauthorized")));
    }

    // Get user from database to access LinkedIn token
    return Mono.fromCallable(() -> {
    User user = userRepository.findById(userDetails.getId())
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    if (user.getLinkedinAccessToken() == null || user.getLinkedinId() == null) {
        throw new RuntimeException("User not connected to LinkedIn");
    }
    
    return user;
    }).flatMap(user -> 
        linkedInService.shareImagePost(user.getLinkedinAccessToken(), user.getLinkedinId(), text, imageUrl)
        .map(response -> ResponseEntity.ok(response)) // Transform JsonNode into ResponseEntity<?>
    );
  }

  @GetMapping("/linkedin/status")
  public ResponseEntity<?> getLinkedInStatus(@AuthenticationPrincipal UserDetailsImpl userDetails) {
    if (userDetails == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(new MessageResponse("Unauthorized"));
    }

    User user = userRepository.findById(userDetails.getId())
        .orElse(null);
    
    if (user == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(new MessageResponse("User not found"));
    }

    boolean isConnected = user.getLinkedinAccessToken() != null && user.getLinkedinId() != null;
    return ResponseEntity.ok(Map.of(
        "connected", isConnected,
        "linkedinId", user.getLinkedinId() != null ? user.getLinkedinId() : ""
    ));
  }
}
