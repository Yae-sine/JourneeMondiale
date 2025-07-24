package com._com.JourneeMondiale.payload.request;

import lombok.*;

@Data
public class EventRegistrationRequest {
        private String participantName;
        private String participantEmail;
        private String notes;
    }