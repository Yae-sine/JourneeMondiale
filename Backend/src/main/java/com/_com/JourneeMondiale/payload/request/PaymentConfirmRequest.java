package com._com.JourneeMondiale.payload.request;

import lombok.Data;

@Data
public class PaymentConfirmRequest {
    private String paymentIntentId;
}
