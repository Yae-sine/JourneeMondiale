package com._com.JourneeMondiale.payload.response;
import lombok.Data;

@Data
public class ChargeResponse {
    private String id;
    private String status;
    private String message;
    private String chargeId;
}