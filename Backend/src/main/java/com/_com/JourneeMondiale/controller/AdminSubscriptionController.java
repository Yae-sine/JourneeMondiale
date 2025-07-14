package com._com.JourneeMondiale.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.payload.response.MessageResponse;
import com._com.JourneeMondiale.payload.response.SubscriptionResponse;
import com._com.JourneeMondiale.service.AdminSubscriptionService;

@RestController
@RequestMapping("/api/admin/subscriptions")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminSubscriptionController {

    @Autowired
    private AdminSubscriptionService adminSubscriptionService;

    /**
     * Get all subscriptions with pagination and filtering
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @param status Filter by subscription status (optional)
     * @param search Search term for user email or plan name (optional)
     * @return Paginated list of subscriptions
     */
    @GetMapping
    public ResponseEntity<?> getAllSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<SubscriptionResponse> subscriptions = adminSubscriptionService.getAllSubscriptions(
                pageable, status, search);
            
            return ResponseEntity.ok(subscriptions);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Erreur lors de la récupération des abonnements"));
        }
    }

    /**
     * Get subscription statistics for admin dashboard
     * 
     * @return Subscription statistics including counts, revenue, etc.
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getSubscriptionStatistics() {
        try {
            var statistics = adminSubscriptionService.getSubscriptionStatistics();
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Erreur lors de la récupération des statistiques"));
        }
    }

    /**
     * Get subscription by ID
     * 
     * @param subscriptionId Database ID of the subscription
     * @return Subscription details
     */
    @GetMapping("/{subscriptionId}")
    public ResponseEntity<?> getSubscriptionById(@PathVariable Long subscriptionId) {
        try {
            Optional<SubscriptionResponse> subscription = adminSubscriptionService.getSubscriptionById(subscriptionId);
            
            if (subscription.isPresent()) {
                return ResponseEntity.ok(subscription.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Abonnement non trouvé"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Erreur lors de la récupération de l'abonnement"));
        }
    }

    /**
     * Get all subscriptions for a specific user
     * 
     * @param userEmail Email of the user
     * @return List of user's subscriptions
     */
    @GetMapping("/user/{userEmail}")
    public ResponseEntity<?> getSubscriptionsByUser(@PathVariable String userEmail) {
        try {
            var subscriptions = adminSubscriptionService.getSubscriptionsByUser(userEmail);
            return ResponseEntity.ok(subscriptions);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Erreur lors de la récupération des abonnements de l'utilisateur"));
        }
    }

    /**
     * Get recent subscriptions for admin dashboard
     * 
     * @param limit Number of recent subscriptions to return (default: 5)
     * @return List of recent subscriptions
     */
    @GetMapping("/recent")
    public ResponseEntity<?> getRecentSubscriptions(@RequestParam(defaultValue = "5") int limit) {
        try {
            var recentSubscriptions = adminSubscriptionService.getRecentSubscriptions(limit);
            return ResponseEntity.ok(recentSubscriptions);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("Erreur lors de la récupération des abonnements récents"));
        }
    }
}
