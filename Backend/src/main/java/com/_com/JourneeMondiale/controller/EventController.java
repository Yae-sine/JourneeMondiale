package com._com.JourneeMondiale.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.dto.EventRegistrationDTO;
import com._com.JourneeMondiale.model.Event;
import com._com.JourneeMondiale.model.EventRegistration;
import com._com.JourneeMondiale.payload.request.EventRegistrationRequest;
import com._com.JourneeMondiale.security.services.UserDetailsImpl;
import com._com.JourneeMondiale.service.EventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {
    
    @Autowired
    private EventService eventService;
    
    @GetMapping("/")
    public ResponseEntity<List<Event>> getAllEvents() {
        List<Event> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Event>> getUpcomingOpenEvents() {
        List<Event> events = eventService.getUpcomingOpenEvents();
        return ResponseEntity.ok(events);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> ResponseEntity.ok(event))
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
        
        List<EventRegistrationDTO> registrationDTOs = registrations.stream().map(this::convertToDTO).collect(Collectors.toList());
        
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
    public ResponseEntity<Event> createEvent(@RequestBody @Valid Event event) {
        Event createdEvent = eventService.createEvent(event);
        return ResponseEntity.ok(createdEvent);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody @Valid Event eventDetails) {
        try {
            Event updatedEvent = eventService.updateEvent(id, eventDetails);
            return ResponseEntity.ok(updatedEvent);
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
        List<EventRegistrationDTO> registrationDTOs = registrations.stream().map(this::convertToDTO).collect(Collectors.toList());
        return ResponseEntity.ok(registrationDTOs);
    }
    
    // Helper method to convert EventRegistration entity to DTO
    private EventRegistrationDTO convertToDTO(EventRegistration registration) {
        EventRegistrationDTO dto = new EventRegistrationDTO();
        dto.setId(registration.getId());
        dto.setParticipantName(registration.getParticipantName());
        dto.setParticipantEmail(registration.getParticipantEmail());
        dto.setNotes(registration.getNotes());
        dto.setRegistrationDate(registration.getRegistrationDate());
        dto.setStatus(registration.getStatus().name());
        
        // Convert event to EventSummaryDTO
        Event event = registration.getEvent();
        EventRegistrationDTO.EventSummaryDTO eventDto = new EventRegistrationDTO.EventSummaryDTO();
        eventDto.setId(event.getId());
        eventDto.setName(event.getName());
        eventDto.setDescription(event.getDescription());
        eventDto.setLocation(event.getLocation());
        eventDto.setEventDate(event.getEventDate());
        eventDto.setRegistrationDeadline(event.getRegistrationDeadline());
        eventDto.setMaxParticipants(event.getMaxParticipants());
        eventDto.setCurrentParticipants(event.getCurrentParticipants());
        eventDto.setEventType(event.getEventType());
        
        dto.setEvent(eventDto);
        
        return dto;
    }
}
