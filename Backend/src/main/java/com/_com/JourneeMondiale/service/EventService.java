package com._com.JourneeMondiale.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com._com.JourneeMondiale.model.Event;
import com._com.JourneeMondiale.model.EventRegistration;
import com._com.JourneeMondiale.model.User;
import com._com.JourneeMondiale.repository.EventRegistrationRepository;
import com._com.JourneeMondiale.repository.EventRepository;
import com._com.JourneeMondiale.repository.UserRepository;

@Service
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private EventRegistrationRepository eventRegistrationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<Event> getAllActiveEvents() {
        return eventRepository.findAllActiveEvents();
    }
    
    public List<Event> getUpcomingOpenEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findUpcomingOpenEvents(now);
    }
    
    public List<Event> getUpcomingEvents() {
        LocalDateTime now = LocalDateTime.now();
        return eventRepository.findUpcomingEvents(now);
    }
    
    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }
    
    public List<Event> getEventsByLocation(String location) {
        return eventRepository.findEventsByLocation(location);
    }
    
    public List<Event> getEventsByType(String eventType) {
        return eventRepository.findEventsByType(eventType);
    }
    
    @Transactional
    public Event createEvent(Event event) {
        event.setCreatedAt(LocalDateTime.now());
        event.setCurrentParticipants(0);
        event.setIsActive(true);
        return eventRepository.save(event);
    }
    
    @Transactional
    public Event updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé avec l'ID: " + id));
        
        event.setName(eventDetails.getName());
        event.setDescription(eventDetails.getDescription());
        event.setLocation(eventDetails.getLocation());
        event.setEventDate(eventDetails.getEventDate());
        event.setRegistrationDeadline(eventDetails.getRegistrationDeadline());
        event.setMaxParticipants(eventDetails.getMaxParticipants());
        event.setEventType(eventDetails.getEventType());
        event.setUpdatedAt(LocalDateTime.now());
        
        return eventRepository.save(event);
    }
    
    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé avec l'ID: " + id));
        event.setIsActive(false);
        eventRepository.save(event);
    }
    
    @Transactional
    public EventRegistration registerUserForEvent(Long eventId, Long userId, String participantName, 
                                                 String participantEmail, String notes) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé avec l'ID: " + eventId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + userId));


        // Check if event is full
        Long currentRegistrations = eventRegistrationRepository.countConfirmedRegistrationsByEventId(eventId);
        if (currentRegistrations >= event.getMaxParticipants()) {
            throw new RuntimeException("Cet événement est complet");
        }
        
        // Check if registration deadline has passed
        if (LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new RuntimeException("La date limite d'inscription est dépassée");
        }
        
        // Check if event date has passed
        if (LocalDateTime.now().isAfter(event.getEventDate())) {
            throw new RuntimeException("Cet événement est déjà passé");
        }
        // Check if user is already registered
        Optional<EventRegistration> existingRegistrationOpt = eventRegistrationRepository.findByUserIdAndEventId(userId, eventId);
        if (existingRegistrationOpt.isPresent()) {
            EventRegistration existingRegistration = existingRegistrationOpt.get();
            if (existingRegistration.getStatus() == EventRegistration.RegistrationStatus.CONFIRMED) {
                throw new RuntimeException("Vous êtes déjà inscrit à cet événement");
            } else if (existingRegistration.getStatus() == EventRegistration.RegistrationStatus.CANCELLED) {
                // Reactivate the registration
                existingRegistration.setStatus(EventRegistration.RegistrationStatus.CONFIRMED);
                existingRegistration.setParticipantName(participantName);
                existingRegistration.setParticipantEmail(participantEmail);
                existingRegistration.setNotes(notes);
                existingRegistration.setRegistrationDate(LocalDateTime.now());
                EventRegistration savedRegistration = eventRegistrationRepository.save(existingRegistration);
                // Update current participants count
                event.setCurrentParticipants(currentRegistrations.intValue());
                eventRepository.save(event);
                return savedRegistration;
            }
        }
        
        
        
        EventRegistration registration = new EventRegistration(event, user, participantName, participantEmail);
        registration.setNotes(notes);
        registration.setStatus(EventRegistration.RegistrationStatus.CONFIRMED);
        
        EventRegistration savedRegistration = eventRegistrationRepository.save(registration);
        
        // Update current participants count
        event.setCurrentParticipants(currentRegistrations.intValue() + 1);
        eventRepository.save(event);
        
        return savedRegistration;
    }
    
    public List<EventRegistration> getUserRegistrations(Long userId) {
        return eventRegistrationRepository.findByUserId(userId);
    }
    
    public List<EventRegistration> getUpcomingUserRegistrations(Long userId) {
        return eventRegistrationRepository.findUpcomingEventsByUserId(userId);
    }
    
    public List<EventRegistration> getEventRegistrations(Long eventId) {
        return eventRegistrationRepository.findByEventId(eventId);
    }
    
    @Transactional
    public void cancelRegistration(Long registrationId, Long userId) {
        EventRegistration registration = eventRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Inscription non trouvée"));
        
        if (!registration.getUser().getId().equals(userId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à annuler cette inscription");
        }
        
        registration.setStatus(EventRegistration.RegistrationStatus.CANCELLED);
        eventRegistrationRepository.save(registration);
        
        // Update current participants count
        Event event = registration.getEvent();
        Long currentRegistrations = eventRegistrationRepository.countConfirmedRegistrationsByEventId(event.getId());
        event.setCurrentParticipants(currentRegistrations.intValue());
        eventRepository.save(event);
    }
}
