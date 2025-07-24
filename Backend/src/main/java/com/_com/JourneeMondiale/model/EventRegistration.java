package com._com.JourneeMondiale.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
@Entity
@Table(name = "event_registrations")
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @NotBlank
    @Size(max = 100)
    private String participantName;

    @NotBlank
    @Size(max = 100)
    private String participantEmail;

    @Size(max = 500)
    private String notes;

    @NotNull
    private LocalDateTime registrationDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private RegistrationStatus status = RegistrationStatus.CONFIRMED;

    public enum RegistrationStatus {
        PENDING, CONFIRMED, CANCELLED
    }

    public EventRegistration() {
        this.registrationDate = LocalDateTime.now();
    }

    public EventRegistration(Event event, User user, String participantName, String participantEmail) {
        this();
        this.event = event;
        this.user = user;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
    }
}
