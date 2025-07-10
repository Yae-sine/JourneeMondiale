package com._com.JourneeMondiale.payload.request;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreateSubscriptionRequest {
    private String priceId; 
    private String planName; 
    private String paymentMethodId; 
    
    // For custom amount subscriptions
    private BigDecimal customAmount; // Custom amount in euros
}
