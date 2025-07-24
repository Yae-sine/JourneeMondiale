package com._com.JourneeMondiale.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.dto.EventRegistrationDTO;
import com._com.JourneeMondiale.dto.EventDTO;
import com._com.JourneeMondiale.model.Event;
import com._com.JourneeMondiale.model.EventRegistration;
import com._com.JourneeMondiale.payload.request.EventRegistrationRequest;
import com._com.JourneeMondiale.security.services.UserDetailsImpl;
import com._com.JourneeMondiale.service.EventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
public class EventController {
    
    @Autowired
    private EventService eventService;
    
    @GetMapping("/")
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        List<EventDTO> eventDTOs = eventService.getUpcomingEvents().stream()
            .map(event -> eventService.convertToEventDTO(event, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(eventDTOs);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcomingOpenEvents() {
        List<EventDTO> eventDTOs = eventService.getUpcomingOpenEvents().stream()
            .map(event -> eventService.convertToEventDTO(event, true))
            .collect(Collectors.toList());
        return ResponseEntity.ok(eventDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> ResponseEntity.ok(eventService.convertToEventDTO(event, true)))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{eventId}/register")
    public ResponseEntity<?> registerForEvent(
            @PathVariable Long eventId,
            @RequestBody @Valid EventRegistrationRequest request,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            EventRegistration registration = eventService.registerUserForEvent(
                    eventId, 
                    userId, 
                    request.getParticipantName(),
                    request.getParticipantEmail(),
                    request.getNotes()
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Inscription réussie à l'événement!");
            response.put("registrationId", registration.getId());
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/my-registrations")
    public ResponseEntity<List<EventRegistrationDTO>> getMyRegistrations(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        List<EventRegistration> registrations = eventService.getUpcomingUserRegistrations(userId);
        List<EventRegistrationDTO> registrationDTOs = registrations.stream()
            .map(eventService::convertToEventRegistrationDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(registrationDTOs);
    }
    
    @DeleteMapping("/registrations/{registrationId}")
    public ResponseEntity<?> cancelRegistration(
            @PathVariable Long registrationId,
            Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            eventService.cancelRegistration(registrationId, userId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Inscription annulée avec succès");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    // Admin endpoints
    @PostMapping("/")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<EventDTO> createEvent(@RequestBody @Valid Event event) {
        Event createdEvent = eventService.createEvent(event);
        EventDTO eventDTO = eventService.convertToEventDTO(createdEvent, false);
        return ResponseEntity.ok(eventDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @RequestBody @Valid Event eventDetails) {
        try {
            Event updatedEvent = eventService.updateEvent(id, eventDetails);
            EventDTO eventDTO = eventService.convertToEventDTO(updatedEvent, false);
            return ResponseEntity.ok(eventDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Événement supprimé avec succès");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping("/{eventId}/registrations")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<EventRegistrationDTO>> getEventRegistrations(@PathVariable Long eventId) {
        List<EventRegistration> registrations = eventService.getEventRegistrations(eventId);
        List<EventRegistrationDTO> registrationDTOs = registrations.stream()
            .map(eventService::convertToEventRegistrationDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(registrationDTOs);
    }
    
}
