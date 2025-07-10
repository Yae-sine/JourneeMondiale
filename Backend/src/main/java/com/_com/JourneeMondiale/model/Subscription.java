package com._com.JourneeMondiale.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String stripeSubscriptionId;

    @Column(nullable = false)
    private String stripeCustomerId;

    @Column(nullable = false)
    private String stripePriceId;

    @Column(nullable = false)
    private String userEmail;

    @Column(nullable = false)
    private String planName; 

    @Column(nullable = false)
    private BigDecimal amount; // Subscription amount per period

    @Column(nullable = false, length = 3)
    private String currency; 

    @Column(nullable = false, name = "billing_interval")
    private String interval; // e.g., "month", "year"

    @Column(nullable = false)
    private String status; // active, past_due, canceled, unpaid, etc.

    private LocalDateTime currentPeriodStart;

    private LocalDateTime currentPeriodEnd;

    private LocalDateTime canceledAt;

    private LocalDateTime endedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Constructor for creating new subscription
    public Subscription(String stripeSubscriptionId, String stripeCustomerId, String stripePriceId,
                       String userEmail, String planName, BigDecimal amount, String currency,
                       String interval, String status, LocalDateTime currentPeriodStart,
                       LocalDateTime currentPeriodEnd) {
        this.stripeSubscriptionId = stripeSubscriptionId;
        this.stripeCustomerId = stripeCustomerId;
        this.stripePriceId = stripePriceId;
        this.userEmail = userEmail;
        this.planName = planName;
        this.amount = amount;
        this.currency = currency;
        this.interval = interval;
        this.status = status;
        this.currentPeriodStart = currentPeriodStart;
        this.currentPeriodEnd = currentPeriodEnd;
    }
}
