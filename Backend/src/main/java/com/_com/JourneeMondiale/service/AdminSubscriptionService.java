package com._com.JourneeMondiale.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com._com.JourneeMondiale.model.Subscription;
import com._com.JourneeMondiale.payload.response.SubscriptionResponse;
import com._com.JourneeMondiale.repository.SubscriptionRepository;
import jakarta.persistence.criteria.Predicate;

@Service
public class AdminSubscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(AdminSubscriptionService.class);

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    /**
     * Get all subscriptions with pagination and filtering for admin
     * 
     * @param pageable Pagination parameters
     * @param status Filter by subscription status (optional)
     * @param search Search term for user email or plan name (optional)
     * @return Paginated list of subscription responses
     */
    public Page<SubscriptionResponse> getAllSubscriptions(Pageable pageable, String status, String search) {
        try {
            Specification<Subscription> spec = null;

            // Filter by status if provided
            if (status != null && !status.trim().isEmpty() && !status.equals("all")) {
                Specification<Subscription> statusSpec = (root, query, criteriaBuilder) -> 
                    criteriaBuilder.equal(root.get("status"), status.trim());
                spec = (spec == null) ? statusSpec : spec.and(statusSpec);
            }

            // Search in user email or plan name if provided
            if (search != null && !search.trim().isEmpty()) {
                String searchTerm = "%" + search.trim().toLowerCase() + "%";
                Specification<Subscription> searchSpec = (root, query, criteriaBuilder) -> {
                    Predicate emailPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("userEmail")), searchTerm);
                    Predicate planNamePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("planName")), searchTerm);
                    return criteriaBuilder.or(emailPredicate, planNamePredicate);
                };
                spec = (spec == null) ? searchSpec : spec.and(searchSpec);
            }

            Page<Subscription> subscriptions = subscriptionRepository.findAll(spec, pageable);
            
            List<SubscriptionResponse> subscriptionResponses = subscriptions.getContent()
                .stream()
                .map(SubscriptionResponse::new)
                .collect(Collectors.toList());

            return new PageImpl<>(subscriptionResponses, pageable, subscriptions.getTotalElements());
            
        } catch (Exception e) {
            logger.error("Error fetching subscriptions with pagination", e);
            throw new RuntimeException("Erreur lors de la récupération des abonnements", e);
        }
    }

    /**
     * Get subscription statistics for admin dashboard
     * 
     * @return Map containing various subscription statistics
     */
    public Map<String, Object> getSubscriptionStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // Total subscriptions count
            long totalSubscriptions = subscriptionRepository.count();
            statistics.put("totalSubscriptions", totalSubscriptions);
            
            // Active subscriptions count
            long activeSubscriptions = subscriptionRepository.countByStatus("active");
            statistics.put("activeSubscriptions", activeSubscriptions);
            
            // Canceled subscriptions count
            long canceledSubscriptions = subscriptionRepository.countByStatus("canceled");
            statistics.put("canceledSubscriptions", canceledSubscriptions);
            
            // Incomplete subscriptions count
            long incompleteSubscriptions = subscriptionRepository.countByStatus("incomplete");
            statistics.put("incompleteSubscriptions", incompleteSubscriptions);
            
            // Calculate total monthly donations from active subscriptions
            List<Subscription> activeMonthlySubscriptions = subscriptionRepository
                .findByStatusAndInterval("active", "month");
            
            BigDecimal monthlyDonations = activeMonthlySubscriptions.stream()
                .map(Subscription::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            statistics.put("monthlyDonations", monthlyDonations);
            
            // Average subscription amount
            if (totalSubscriptions > 0) {
                List<Subscription> allSubscriptions = subscriptionRepository.findAll();
                BigDecimal totalAmount = allSubscriptions.stream()
                    .map(Subscription::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                BigDecimal averageAmount = totalAmount.divide(
                    BigDecimal.valueOf(totalSubscriptions), 2, RoundingMode.HALF_UP
                );
                statistics.put("averageSubscriptionAmount", averageAmount);
            } else {
                statistics.put("averageSubscriptionAmount", BigDecimal.ZERO);
            }
            
            // Subscription status distribution
            Map<String, Long> statusDistribution = new HashMap<>();
            statusDistribution.put("active", activeSubscriptions);
            statusDistribution.put("canceled", canceledSubscriptions);
            statusDistribution.put("incomplete", incompleteSubscriptions);
            statistics.put("statusDistribution", statusDistribution);
            
            // Recent subscriptions count (last 30 days)
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            long recentSubscriptions = subscriptionRepository.countByCreatedAtAfter(thirtyDaysAgo);
            statistics.put("recentSubscriptions", recentSubscriptions);
            
            return statistics;
            
        } catch (Exception e) {
            logger.error("Error calculating subscription statistics", e);
            throw new RuntimeException("Erreur lors du calcul des statistiques", e);
        }
    }

    /**
     * Get subscription by ID for admin
     * 
     * @param subscriptionId Database ID of the subscription
     * @return Optional subscription response
     */
    public Optional<SubscriptionResponse> getSubscriptionById(Long subscriptionId) {
        try {
            return subscriptionRepository.findById(subscriptionId)
                .map(SubscriptionResponse::new);
                
        } catch (Exception e) {
            logger.error("Error fetching subscription by ID: {}", subscriptionId, e);
            throw new RuntimeException("Erreur lors de la récupération de l'abonnement", e);
        }
    }

    /**
     * Get all subscriptions for a specific user
     * 
     * @param userEmail Email of the user
     * @return List of user's subscription responses
     */
    public List<SubscriptionResponse> getSubscriptionsByUser(String userEmail) {
        try {
            List<Subscription> subscriptions = subscriptionRepository
                .findByUserEmailOrderByCreatedAtDesc(userEmail);
            
            return subscriptions.stream()
                .map(SubscriptionResponse::new)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error fetching subscriptions for user: {}", userEmail, e);
            throw new RuntimeException("Erreur lors de la récupération des abonnements de l'utilisateur", e);
        }
    }

    /**
     * Get recent subscriptions for admin dashboard
     * 
     * @param limit Number of recent subscriptions to return
     * @return List of recent subscription responses
     */
    public List<SubscriptionResponse> getRecentSubscriptions(int limit) {
        try {
            Pageable pageable = Pageable.ofSize(limit);
            Page<Subscription> recentSubscriptions = subscriptionRepository
                .findAllByOrderByCreatedAtDesc(pageable);
            
            return recentSubscriptions.getContent().stream()
                .map(SubscriptionResponse::new)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            logger.error("Error fetching recent subscriptions", e);
            throw new RuntimeException("Erreur lors de la récupération des abonnements récents", e);
        }
    }
}
