package com._com.JourneeMondiale.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com._com.JourneeMondiale.model.Subscription;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long>, JpaSpecificationExecutor<Subscription> {
    
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
    
    /**
     * Count subscriptions by status
     */
    long countByStatus(String status);
    
    /**
     * Find subscriptions by status and billing interval
     */
    List<Subscription> findByStatusAndInterval(String status, String interval);
    
    /**
     * Count subscriptions created after a specific date
     */
    long countByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find all subscriptions ordered by creation date descending
     */
    Page<Subscription> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
