package com._com.JourneeMondiale.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventRegistrationDTO {
    private Long id;
    private String participantName;
    private String participantEmail;
    private String notes;
    private LocalDateTime registrationDate;
    private String status;
    private EventSummaryDTO event;

    // Default constructor
    public EventRegistrationDTO() {}

    // Constructor with parameters
    public EventRegistrationDTO(Long id, String participantName, String participantEmail, String notes, LocalDateTime registrationDate, 
                               String status, EventSummaryDTO event) {
        this.id = id;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
        this.notes = notes;
        this.registrationDate = registrationDate;
        this.status = status;
        this.event = event;
    }

    // Nested EventSummaryDTO class
    public static class EventSummaryDTO {
        private Long id;
        private String name;
        private String description;
        private String location;
        private LocalDateTime eventDate;
        private LocalDateTime registrationDeadline;
        private Integer maxParticipants;
        private Integer currentParticipants;
        private String eventType;

        // Default constructor
        public EventSummaryDTO() {}

        // Constructor with parameters
        public EventSummaryDTO(Long id, String name, String description, String location, 
                              LocalDateTime eventDate, LocalDateTime registrationDeadline,
                              Integer maxParticipants, Integer currentParticipants, String eventType) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.location = location;
            this.eventDate = eventDate;
            this.registrationDeadline = registrationDeadline;
            this.maxParticipants = maxParticipants;
            this.currentParticipants = currentParticipants;
            this.eventType = eventType;
        }

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public LocalDateTime getEventDate() {
            return eventDate;
        }

        public void setEventDate(LocalDateTime eventDate) {
            this.eventDate = eventDate;
        }

        public LocalDateTime getRegistrationDeadline() {
            return registrationDeadline;
        }

        public void setRegistrationDeadline(LocalDateTime registrationDeadline) {
            this.registrationDeadline = registrationDeadline;
        }

        public Integer getMaxParticipants() {
            return maxParticipants;
        }

        public void setMaxParticipants(Integer maxParticipants) {
            this.maxParticipants = maxParticipants;
        }

        public Integer getCurrentParticipants() {
            return currentParticipants;
        }

        public void setCurrentParticipants(Integer currentParticipants) {
            this.currentParticipants = currentParticipants;
        }

        public String getEventType() {
            return eventType;
        }

        public void setEventType(String eventType) {
            this.eventType = eventType;
        }
    }
}
