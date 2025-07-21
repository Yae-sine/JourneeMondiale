package com._com.JourneeMondiale.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventDTO {
    private Long id;
    private String name;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private LocalDateTime registrationDeadline;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private String eventType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<EventRegistrationDTO> registrations;

    public EventDTO() {}
}
