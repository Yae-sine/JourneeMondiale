package com._com.JourneeMondiale.payload.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

/**
 * Request DTO for confirming a payment intent
 */
@Data
public class PaymentIntentConfirmRequest {
    
    @NotBlank
    private String paymentIntentId;
    
    @NotBlank
    private String paymentMethodId;
    
    public PaymentIntentConfirmRequest() {}
    
    public PaymentIntentConfirmRequest(String paymentIntentId, String paymentMethodId) {
        this.paymentIntentId = paymentIntentId;
        this.paymentMethodId = paymentMethodId;
    }
}
