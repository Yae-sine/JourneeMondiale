package com._com.JourneeMondiale.security;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com._com.JourneeMondiale.security.Jwt.AuthEntryPointJwt;
import com._com.JourneeMondiale.security.Jwt.AuthTokenFilter;
import com._com.JourneeMondiale.security.oauth2.CustomOAuth2UserService;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {
  
  @Value("${spring.h2.console.path}")
  private String h2ConsolePath;
  
  private final AuthEntryPointJwt unauthorizedHandler;
  private final CustomOAuth2UserService customOAuth2UserService;
  
  public WebSecurityConfig(AuthEntryPointJwt unauthorizedHandler, CustomOAuth2UserService customOAuth2UserService) {
    this.unauthorizedHandler = unauthorizedHandler;
    this.customOAuth2UserService = customOAuth2UserService;
  }

  @Bean
  public AuthTokenFilter authenticationJwtTokenFilter() {
    return new AuthTokenFilter();
  }
  
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
  
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> 
          auth.requestMatchers("/api/auth/signin", "/api/auth/signup").permitAll()
              .requestMatchers("/api/auth/oauth2/**").permitAll()
              .requestMatchers("/oauth2/**").permitAll()
              .requestMatchers("/login/oauth2/**").permitAll()
              .requestMatchers("/api/admin/**").hasRole("ADMIN")
              .requestMatchers("/api/subscriptions/webhook").permitAll() // Allow Stripe webhooks
              .requestMatchers(h2ConsolePath + "/**").permitAll()
              .anyRequest().authenticated()
        )
        .oauth2Login(oauth2 -> 
          oauth2
            .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
            .defaultSuccessUrl("/api/auth/oauth2/success", true)
            .failureUrl("/api/auth/oauth2/failure")
            .tokenEndpoint(tokenEndpoint -> tokenEndpoint.accessTokenResponseClient(linkedInAccessTokenResponseClient()))
        );
    // fix H2 database console: Refused to display ' in a frame because it set 'X-Frame-Options' to 'deny'
    http.headers(headers -> headers.frameOptions(frameOption -> frameOption.sameOrigin()));

    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
  }
  @Bean
  public LinkedInAccessTokenResponseClient linkedInAccessTokenResponseClient() {
    return new LinkedInAccessTokenResponseClient();
  }
  @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000","*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}