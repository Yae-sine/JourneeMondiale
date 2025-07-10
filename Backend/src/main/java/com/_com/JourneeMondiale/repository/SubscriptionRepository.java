package com._com.JourneeMondiale.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com._com.JourneeMondiale.model.Subscription;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    
    /**
     * Find subscription by Stripe subscription ID
     */
    Optional<Subscription> findByStripeSubscriptionId(String stripeSubscriptionId);
    
    /**
     * Find active subscription for a user email
     */
    Optional<Subscription> findByUserEmailAndStatus(String userEmail, String status);
    
    /**
     * Find all subscriptions for a user email, ordered by creation date descending
     */
    List<Subscription> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    
    /**
     * Find subscription by Stripe customer ID
     */
    List<Subscription> findByStripeCustomerId(String stripeCustomerId);
    
    /**
     * Find all subscriptions with specific status
     */
    List<Subscription> findByStatusOrderByCreatedAtDesc(String status);
    
    /**
     * Check if user has any active subscription
     */
    boolean existsByUserEmailAndStatus(String userEmail, String status);
}
