package com._com.JourneeMondiale.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.payload.request.CreateSubscriptionRequest;
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
     * Activate subscription after successful payment
     * 
     * @param subscriptionId Database ID of the subscription to activate
     * @param userDetails Authenticated user details
     * @return ResponseEntity with updated subscription details
     */
    @PostMapping("/activate/{subscriptionId}")
    public ResponseEntity<?> activateSubscription(
            @PathVariable Long subscriptionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new MessageResponse("User not authenticated"));
        }

        try {
            SubscriptionResponse subscription = paymentService.activateSubscription(subscriptionId);
            
            // Verify that the subscription belongs to the authenticated user
            if (!subscription.getUserEmail().equals(userDetails.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new MessageResponse("Access denied: subscription does not belong to user"));
            }
            
            return ResponseEntity.ok(subscription);
            
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("An unexpected error occurred"));
        }
    }

}
