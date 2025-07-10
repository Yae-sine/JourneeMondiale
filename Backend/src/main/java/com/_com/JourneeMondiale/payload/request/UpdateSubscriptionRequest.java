package com._com.JourneeMondiale.payload.request;

import lombok.Data;

@Data
public class UpdateSubscriptionRequest {
    private String newPriceId; // New Stripe price ID to change to
    private String newPlanName; // New human-readable plan name
    private boolean prorationBehavior = true; // Whether to prorate the change
}
