package com._com.JourneeMondiale.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.payload.request.PaymentConfirmRequest;
import com._com.JourneeMondiale.payload.request.PaymentIntentRequest;
import com._com.JourneeMondiale.service.StripeService;
import com.stripe.exception.StripeException;

@RestController
@RequestMapping("/api/payment")
public class StripeController {

    @Autowired
    private StripeService paymentService;

    /**
     * Creates a Payment Intent for processing donations
     * 
     * @param request Payment intent request containing amount, currency, and customer details
     * @return ResponseEntity with client secret and payment intent ID or error details
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(
            @RequestBody PaymentIntentRequest request) {
        try {
            Map<String, Object> response = paymentService.createPaymentIntent(request);
            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, Object> errorResponse = Map.of("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Confirms payment and saves donation record
     * 
     * @param request Payment confirmation request containing payment intent ID
     * @return ResponseEntity with payment status and details
     */
    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmPayment(
            @RequestBody PaymentConfirmRequest request) {
        try {
            Map<String, Object> response = paymentService.confirmPayment(request);
            
            String status = (String) response.get("status");
            if ("success".equals(status)) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (StripeException e) {
            Map<String, Object> errorResponse = Map.of("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}