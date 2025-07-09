package com._com.JourneeMondiale.service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com._com.JourneeMondiale.model.Donation;
import com._com.JourneeMondiale.payload.request.PaymentConfirmRequest;
import com._com.JourneeMondiale.payload.request.PaymentIntentRequest;
import com._com.JourneeMondiale.repository.DonationRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import jakarta.annotation.PostConstruct;

@Service
public class StripeService {

    @Value("${STRIPE_SECRET_KEY}")
    private String stripeSecretKey;

    @Autowired
    private DonationRepository donationRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Creates a Payment Intent with Stripe
     * 
     * @param request Payment intent request containing amount, currency, customer details
     * @return Map containing client secret and payment intent ID
     * @throws StripeException if Stripe API call fails
     */
    public Map<String, Object> createPaymentIntent(PaymentIntentRequest request) throws StripeException {
        // Create Payment Intent with Stripe
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
            .setAmount((long) request.getAmount()) // Amount in cents
            .setCurrency(request.getCurrency())
            .setDescription(request.getDescription())
            .setReceiptEmail(request.getCustomerEmail())
            .putMetadata("customerName", request.getCustomerName())
            .putMetadata("customerEmail", request.getCustomerEmail())
            .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                    .setEnabled(true)
                    .build()
            )
            .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        Map<String, Object> response = new HashMap<>();
        response.put("clientSecret", paymentIntent.getClientSecret());
        response.put("paymentIntentId", paymentIntent.getId());

        return response;
    }

    /**
     * Confirms payment and saves donation to database if successful
     * 
     * @param request Payment confirmation request containing payment intent ID
     * @return Map containing payment status and details
     * @throws StripeException if Stripe API call fails
     */
    public Map<String, Object> confirmPayment(PaymentConfirmRequest request) throws StripeException {
        // Retrieve the payment intent to verify status
        PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());

        Map<String, Object> response = new HashMap<>();
        
        if ("succeeded".equals(paymentIntent.getStatus())) {
            // Payment successful - save to database
            saveDonation(paymentIntent);
            
            response.put("status", "success");
            response.put("message", "Payment processed successfully");
            response.put("paymentIntentId", paymentIntent.getId());
            response.put("amount", paymentIntent.getAmount());
            response.put("currency", paymentIntent.getCurrency());
            
            return response;
        } else {
            response.put("status", "failed");
            response.put("message", "Payment not completed");
            response.put("paymentStatus", paymentIntent.getStatus());
            
            return response;
        }
    }

    /**
     * Saves successful donation to database
     * 
     * @param paymentIntent Stripe PaymentIntent object containing payment details
     */
    private void saveDonation(PaymentIntent paymentIntent) {
        try {
            // Convert amount from cents to decimal
            BigDecimal amount = new BigDecimal(paymentIntent.getAmount()).divide(new BigDecimal(100));
            
            // Get customer info from metadata
            String customerName = paymentIntent.getMetadata().get("customerName");
            String customerEmail = paymentIntent.getMetadata().get("customerEmail");
            
            // Create and save donation record
            Donation donation = new Donation(
                paymentIntent.getId(),
                amount,
                paymentIntent.getCurrency().toUpperCase(),
                customerName,
                customerEmail,
                paymentIntent.getDescription(),
                "succeeded"
            );
            
            donationRepository.save(donation);
            
            System.out.println("Donation saved: " + donation.getId() + 
                " - " + customerName + " donated " + amount + " " + paymentIntent.getCurrency());
            
        } catch (Exception e) {
            System.err.println("Error saving donation: " + e.getMessage());
            // Log error but don't throw exception to avoid failing the payment confirmation
        }
    }

    /**
     * Handles webhook events from Stripe (placeholder for future implementation)
     * 
     * @param payload Raw webhook payload
     * @param signature Stripe signature header
     * @return Processing result message
     */
    public String handleWebhook(String payload, String signature) {
        // TODO: Implement webhook signature verification and event handling
        // This is a placeholder for future webhook implementation
        
        try {
            // In production, you should:
            // 1. Verify the webhook signature
            // 2. Parse the event
            // 3. Handle different event types (payment_intent.succeeded, payment_intent.payment_failed, etc.)
            
            System.out.println("Webhook received with signature: " + signature);
            
            return "Webhook received";
        } catch (Exception e) {
            System.err.println("Webhook processing error: " + e.getMessage());
            throw new RuntimeException("Webhook processing failed");
        }
    }
}
