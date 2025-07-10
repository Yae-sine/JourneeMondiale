package com._com.JourneeMondiale.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.payload.request.CreateSubscriptionRequest;
import com._com.JourneeMondiale.payload.request.PaymentIntentConfirmRequest;
import com._com.JourneeMondiale.payload.request.UpdateSubscriptionRequest;
import com._com.JourneeMondiale.payload.response.MessageResponse;
import com._com.JourneeMondiale.payload.response.SubscriptionResponse;
import com._com.JourneeMondiale.security.services.UserDetailsImpl;
import com._com.JourneeMondiale.service.SubscriptionService;
import com.stripe.exception.StripeException;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService paymentService;

    /**
     * Create a new subscription for the authenticated user
     * 
     * @param request Subscription creation request
     * @param userDetails Authenticated user details
     * @return ResponseEntity with subscription details and client secret
     */
    @PostMapping("/create")
    public ResponseEntity<?> createSubscription(
            @RequestBody CreateSubscriptionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
        }

        try {
            String userEmail = userDetails.getEmail();
            String userName = userDetails.getFirstName() + " " + userDetails.getLastName();
            
            SubscriptionResponse response = paymentService.createSubscription(request, userEmail, userName);
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(e.getMessage()));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Payment service error: " + e.getMessage()));
        } catch (Exception e) {
            String message=e.getMessage();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse(message));
        }
    }

    /**
     * Update an existing subscription (change plan)
     * 
     * @param request Update subscription request
     * @param userDetails Authenticated user details
     * @return ResponseEntity with updated subscription details
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateSubscription(
            @RequestBody UpdateSubscriptionRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
        }

        try {
            String userEmail = userDetails.getEmail();
            SubscriptionResponse response = paymentService.updateSubscription(request, userEmail);
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(e.getMessage()));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Payment service error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("An unexpected error occurred"));
        }
    }

    /**
     * Cancel the user's subscription
     * 
     * @param immediate Whether to cancel immediately or at period end
     * @param userDetails Authenticated user details
     * @return ResponseEntity with cancellation confirmation
     */
    @DeleteMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(
            @RequestParam(defaultValue = "false") boolean immediate,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
        }

        try {
            String userEmail = userDetails.getEmail();
            SubscriptionResponse response = paymentService.cancelSubscription(userEmail, immediate);
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(e.getMessage()));
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Payment service error: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("An unexpected error occurred"));
        }
    }

    /**
     * Get the current user's subscription information
     * 
     * @param userDetails Authenticated user details
     * @return ResponseEntity with subscription details or null if no subscription
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentSubscription(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
        }

        try {
            String userEmail = userDetails.getEmail();
            Optional<SubscriptionResponse> subscription = paymentService.getCurrentSubscription(userEmail);
            
            if (subscription.isPresent()) {
                return ResponseEntity.ok(subscription.get());
            } else {
                return ResponseEntity.ok(new MessageResponse("No active subscription found"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("An unexpected error occurred"));
        }
    }

    /**
     * Confirm a payment intent for subscription
     * 
     * @param request Payment intent confirmation request
     * @param userDetails Authenticated user details
     * @return ResponseEntity with payment intent status
     */
    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPaymentIntent(
            @RequestBody PaymentIntentConfirmRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
        }

        try {
            com.stripe.model.PaymentIntent paymentIntent = paymentService.confirmPaymentIntent(
                request.getPaymentIntentId(), 
                request.getPaymentMethodId()
            );
            
            Map<String, Object> response = Map.of(
                "status", paymentIntent.getStatus(),
                "paymentIntentId", paymentIntent.getId(),
                "clientSecret", paymentIntent.getClientSecret()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Payment confirmation failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("An unexpected error occurred"));
        }
    }

    /**
     * Get payment intent status
     * 
     * @param paymentIntentId Payment intent ID
     * @param userDetails Authenticated user details
     * @return ResponseEntity with payment intent status
     */
    @GetMapping("/payment-status")
    public ResponseEntity<?> getPaymentIntentStatus(
            @RequestParam String paymentIntentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
        }

        try {
            com.stripe.model.PaymentIntent paymentIntent = paymentService.getPaymentIntentStatus(paymentIntentId);
            
            Map<String, Object> response = Map.of(
                "status", paymentIntent.getStatus(),
                "paymentIntentId", paymentIntent.getId(),
                "amount", paymentIntent.getAmount(),
                "currency", paymentIntent.getCurrency()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (StripeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Failed to get payment status: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("An unexpected error occurred"));
        }
    }

    /**
     * Handle Stripe webhook events for subscriptions
     * 
     * @param payload Raw webhook payload from Stripe
     * @param sigHeader Stripe signature header for verification
     * @return ResponseEntity with processing result
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleSubscriptionWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        try {
            String result = paymentService.handleSubscriptionWebhook(payload, sigHeader);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Webhook error: " + e.getMessage());
        }
    }
}
