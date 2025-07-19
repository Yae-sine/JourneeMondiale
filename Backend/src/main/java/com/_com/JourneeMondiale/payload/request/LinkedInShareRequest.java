package com._com.JourneeMondiale.payload.request;

import jakarta.validation.constraints.NotBlank;

public class LinkedInShareRequest {
    @NotBlank
    private String text;
    
    private String imageUrl;

    public LinkedInShareRequest() {}

    public LinkedInShareRequest(String text, String imageUrl) {
        this.text = text;
        this.imageUrl = imageUrl;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
