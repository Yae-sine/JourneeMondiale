package com._com.JourneeMondiale.payload.request;

public class EventRegistrationRequest {
        private String participantName;
        private String participantEmail;
        private String notes;
        
        public String getParticipantName() {
            return participantName;
        }
        
        public void setParticipantName(String participantName) {
            this.participantName = participantName;
        }
        
        public String getParticipantEmail() {
            return participantEmail;
        }
        
        public void setParticipantEmail(String participantEmail) {
            this.participantEmail = participantEmail;
        }
        
        public String getNotes() {
            return notes;
        }
        
        public void setNotes(String notes) {
            this.notes = notes;
        }
    }