package com._com.JourneeMondiale.service;

import com.stripe.exception.*;
import com.stripe.model.Charge;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com._com.JourneeMondiale.payload.request.ChargeRequest;
import java.util.HashMap;
import java.util.Map;


@Service
public class StripeService {

    @Value("${STRIPE_SECRET_KEY}")
    private String secretKey;

    public Charge createCharge(ChargeRequest chargeRequest) throws StripeException {
        Map<String, Object> chargeParams = new HashMap<>();
        chargeParams.put("amount", chargeRequest.getAmount());
        chargeParams.put("currency", chargeRequest.getCurrency());
        chargeParams.put("description", chargeRequest.getDescription());
        chargeParams.put("source", chargeRequest.getStripeToken()); // Use "source" instead of "card"
        chargeParams.put("receipt_email", chargeRequest.getStripeEmail()); // Optional

        return Charge.create(chargeParams);
    }
}