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
import lombok.Data;

@Data
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
}
