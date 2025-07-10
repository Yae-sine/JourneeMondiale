package com._com.JourneeMondiale.payload.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for confirming a payment intent
 */
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
    
    public String getPaymentIntentId() {
        return paymentIntentId;
    }
    
    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
    
    public String getPaymentMethodId() {
        return paymentMethodId;
    }
    
    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
}
