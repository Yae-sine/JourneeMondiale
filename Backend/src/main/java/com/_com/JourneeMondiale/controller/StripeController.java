package com._com.JourneeMondiale.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com._com.JourneeMondiale.payload.request.ChargeRequest;
import com._com.JourneeMondiale.payload.response.ChargeResponse;
import com._com.JourneeMondiale.service.StripeService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class StripeController {

    @Autowired
    private StripeService stripeService;

    @PostMapping("/charge")
    public ResponseEntity<ChargeResponse> charge(@RequestBody ChargeRequest chargeRequest) {
        try {
            Charge charge = stripeService.createCharge(chargeRequest);
            ChargeResponse response = new ChargeResponse();
            response.setId(charge.getId());
            response.setStatus(charge.getStatus());
            response.setMessage("Payment successful!");
            response.setChargeId(charge.getId());
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (StripeException e) {
            ChargeResponse response = new ChargeResponse();
            response.setStatus("error");
            response.setMessage(e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}