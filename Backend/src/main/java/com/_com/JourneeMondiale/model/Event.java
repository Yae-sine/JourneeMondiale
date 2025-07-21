package com._com.JourneeMondiale.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotBlank
    @Size(max = 1000)
    private String description;

    @NotBlank
    @Size(max = 100)
    private String location;

    @NotNull
    private LocalDateTime eventDate;

    @NotNull
    private LocalDateTime registrationDeadline;

    @NotNull
    private Integer maxParticipants;

    private Integer currentParticipants = 0;

    @NotBlank
    @Size(max = 50)
    private String eventType; // MARATHON, RUN, WALK, etc.

    @NotNull
    private Boolean isActive = true;


    @NotNull
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    // @JsonManagedReference
    private Set<EventRegistration> registrations = new HashSet<>();

    public Event() {
        this.createdAt = LocalDateTime.now();
    }

    public Event(String name, String description, String location, LocalDateTime eventDate, 
                 LocalDateTime registrationDeadline, Integer maxParticipants, String eventType) {
        this();
        this.name = name;
        this.description = description;
        this.location = location;
        this.eventDate = eventDate;
        this.registrationDeadline = registrationDeadline;
        this.maxParticipants = maxParticipants;
        this.eventType = eventType;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<EventRegistration> getRegistrations() {
        return registrations;
    }

    public void setRegistrations(Set<EventRegistration> registrations) {
        this.registrations = registrations;
    }
}
