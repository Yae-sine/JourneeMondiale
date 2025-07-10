package com._com.JourneeMondiale.payload.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SubscriptionResponse {
    private Long id;
    private String stripeSubscriptionId;
    private String stripeCustomerId;
    private String stripePriceId;
    private String userEmail;
    private String planName;
    private BigDecimal amount;
    private String currency;
    private String interval;
    private String status;
    private LocalDateTime currentPeriodStart;
    private LocalDateTime currentPeriodEnd;
    private LocalDateTime canceledAt;
    private LocalDateTime endedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Client secret for payment setup (only when creating new subscription)
    private String clientSecret;
    
    public SubscriptionResponse() {}
    
    public SubscriptionResponse(com._com.JourneeMondiale.model.Subscription subscription) {
        this.id = subscription.getId();
        this.stripeSubscriptionId = subscription.getStripeSubscriptionId();
        this.stripeCustomerId = subscription.getStripeCustomerId();
        this.stripePriceId = subscription.getStripePriceId();
        this.userEmail = subscription.getUserEmail();
        this.planName = subscription.getPlanName();
        this.amount = subscription.getAmount();
        this.currency = subscription.getCurrency();
        this.interval = subscription.getInterval();
        this.status = subscription.getStatus();
        this.currentPeriodStart = subscription.getCurrentPeriodStart();
        this.currentPeriodEnd = subscription.getCurrentPeriodEnd();
        this.canceledAt = subscription.getCanceledAt();
        this.endedAt = subscription.getEndedAt();
        this.createdAt = subscription.getCreatedAt();
        this.updatedAt = subscription.getUpdatedAt();
    }
}
