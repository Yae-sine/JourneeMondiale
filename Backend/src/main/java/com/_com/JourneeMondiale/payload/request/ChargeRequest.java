package com._com.JourneeMondiale.payload.request;
    
import lombok.Data;
@Data
public class ChargeRequest {

    private String description;
    private int amount;
    private String currency = "EUR";
    private String stripeEmail;
    private String stripeToken;
}