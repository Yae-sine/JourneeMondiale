package com._com.JourneeMondiale.payload.request;

import lombok.Data;

@Data
public class PaymentIntentRequest {
    private int amount;
    private String currency;
    private String description;
    private String customerEmail;
    private String customerName;
}
