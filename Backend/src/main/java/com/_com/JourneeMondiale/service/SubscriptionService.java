package com._com.JourneeMondiale.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com._com.JourneeMondiale.model.Subscription;
import com._com.JourneeMondiale.payload.request.CreateSubscriptionRequest;
import com._com.JourneeMondiale.payload.request.UpdateSubscriptionRequest;
import com._com.JourneeMondiale.payload.response.SubscriptionResponse;
import com._com.JourneeMondiale.repository.SubscriptionRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Price;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.CustomerSearchParams;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.SubscriptionCreateParams;
import com.stripe.param.SubscriptionUpdateParams;

import jakarta.annotation.PostConstruct;

@Service
public class SubscriptionService {

    @Value("${STRIPE_SECRET_KEY}")
    private String stripeSecretKey;

    @Value("${STRIPE_PRODUCT_ID}")
    private String stripeProductId;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    /**
     * Creates a new subscription for the authenticated user
     * 
     * @param request Subscription creation request
     * @param userEmail Email of the authenticated user
     * @param userName Full name of the authenticated user
     * @return SubscriptionResponse containing subscription details and client secret
     * @throws StripeException if Stripe API call fails
     */
    public SubscriptionResponse createSubscription(CreateSubscriptionRequest request, String userEmail, String userName) throws StripeException {
        // Validate request
        if (request.getPriceId() == null && request.getCustomAmount() == null) {
            throw new IllegalArgumentException("Either priceId or customAmount must be provided");
        }
        
        if (request.getCustomAmount() != null && request.getCustomAmount().compareTo(new BigDecimal("5")) < 0) {
            throw new IllegalArgumentException("Custom amount must be at least 5€");
        }

        // Check if user already has an active subscription
        Optional<Subscription> existingSubscription = subscriptionRepository.findByUserEmailAndStatus(userEmail, "active");
        if (existingSubscription.isPresent()) {
            throw new IllegalStateException("User already has an active subscription");
        }

        // Get or create Stripe customer
        Customer customer = getOrCreateCustomer(userEmail, userName);

        // Get or create price details from Stripe
        Price price;
        if (request.getCustomAmount() != null) {
            // Create a custom price for this amount
            price = createCustomPrice(request.getCustomAmount(), "eur");
        } else {
            // Use predefined price
            price = Price.retrieve(request.getPriceId());
        }

        // Create subscription in Stripe
        SubscriptionCreateParams subscriptionParams = SubscriptionCreateParams.builder()
            .setCustomer(customer.getId())
            .addItem(SubscriptionCreateParams.Item.builder()
                .setPrice(price.getId()) // Use the price ID from the retrieved/created price
                .build())
            .setPaymentBehavior(SubscriptionCreateParams.PaymentBehavior.DEFAULT_INCOMPLETE)
            .setPaymentSettings(SubscriptionCreateParams.PaymentSettings.builder()
                .setSaveDefaultPaymentMethod(SubscriptionCreateParams.PaymentSettings.SaveDefaultPaymentMethod.ON_SUBSCRIPTION)
                .build())
            .build();

        com.stripe.model.Subscription stripeSubscription = com.stripe.model.Subscription.create(subscriptionParams);

        // Create PaymentIntent for the initial payment
        PaymentIntent paymentIntent = null;
        if (stripeSubscription.getLatestInvoice() != null) {
            // Get the latest invoice and create payment intent if needed
            com.stripe.model.Invoice invoice = com.stripe.model.Invoice.retrieve(stripeSubscription.getLatestInvoice());
            
            if (invoice.getPaymentIntent() != null) {
                // Use existing payment intent from the invoice
                paymentIntent = PaymentIntent.retrieve(invoice.getPaymentIntent());
            } else {
                // Create a new payment intent for the subscription amount
                long amountInCents = price.getUnitAmount();
                
                PaymentIntentCreateParams paymentIntentParams = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(price.getCurrency())
                    .setCustomer(customer.getId())
                    .addPaymentMethodType("card")
                    .setSetupFutureUsage(PaymentIntentCreateParams.SetupFutureUsage.OFF_SESSION)
                    .putMetadata("subscription_id", stripeSubscription.getId())
                    .putMetadata("user_email", userEmail)
                    .build();
                
                paymentIntent = PaymentIntent.create(paymentIntentParams);
            }
        }

        // Save subscription to database
        Subscription subscription = saveSubscriptionToDatabase(stripeSubscription, userEmail, request.getPlanName(), price);

        // Prepare response
        SubscriptionResponse response = new SubscriptionResponse(subscription);
        
        // Add client secret for frontend payment confirmation
        if (paymentIntent != null) {
            response.setClientSecret(paymentIntent.getClientSecret());
        }
        
        return response;
    }

    /**
     * Updates an existing subscription (change plan/price)
     * 
     * @param request Update subscription request
     * @param userEmail Email of the authenticated user
     * @return Updated SubscriptionResponse
     * @throws StripeException if Stripe API call fails
     */
    public SubscriptionResponse updateSubscription(UpdateSubscriptionRequest request, String userEmail) throws StripeException {
        // Find user's active subscription
        Optional<Subscription> existingSubscription = subscriptionRepository.findByUserEmailAndStatus(userEmail, "active");
        if (existingSubscription.isEmpty()) {
            throw new IllegalStateException("No active subscription found for user");
        }

        Subscription subscription = existingSubscription.get();

        // Get new price details
        Price newPrice = Price.retrieve(request.getNewPriceId());

        // Retrieve Stripe subscription
        com.stripe.model.Subscription stripeSubscription = com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());

        // Update subscription in Stripe
        SubscriptionUpdateParams updateParams = SubscriptionUpdateParams.builder()
            .addItem(SubscriptionUpdateParams.Item.builder()
                .setId(stripeSubscription.getItems().getData().get(0).getId())
                .setPrice(request.getNewPriceId())
                .build())
            .setProrationBehavior(request.isProrationBehavior() ? 
                SubscriptionUpdateParams.ProrationBehavior.CREATE_PRORATIONS : 
                SubscriptionUpdateParams.ProrationBehavior.NONE)
            .build();

        com.stripe.model.Subscription updatedStripeSubscription = stripeSubscription.update(updateParams);

        // Update subscription in database
        updateSubscriptionInDatabase(subscription, updatedStripeSubscription, request.getNewPlanName(), newPrice);

        return new SubscriptionResponse(subscription);
    }

    /**
     * Cancels a subscription
     * 
     * @param userEmail Email of the authenticated user
     * @param immediate Whether to cancel immediately or at period end
     * @return Canceled SubscriptionResponse
     * @throws StripeException if Stripe API call fails
     */
    public SubscriptionResponse cancelSubscription(String userEmail, boolean immediate) throws StripeException {
        // Find user's active subscription
        Optional<Subscription> existingSubscription = subscriptionRepository.findByUserEmailAndStatus(userEmail, "active");
        if (existingSubscription.isEmpty()) {
            throw new IllegalStateException("No active subscription found for user");
        }

        Subscription subscription = existingSubscription.get();

        // Cancel subscription in Stripe
        com.stripe.model.Subscription stripeSubscription = com.stripe.model.Subscription.retrieve(subscription.getStripeSubscriptionId());
        
        com.stripe.model.Subscription canceledSubscription;
        if (immediate) {
            // Cancel immediately
            canceledSubscription = stripeSubscription.cancel();
        } else {
            // Cancel at period end
            SubscriptionUpdateParams updateParams = SubscriptionUpdateParams.builder()
                .setCancelAtPeriodEnd(true)
                .build();
            canceledSubscription = stripeSubscription.update(updateParams);
        }

        // Update subscription status in database
        subscription.setStatus(canceledSubscription.getStatus());
        if (canceledSubscription.getCanceledAt() != null) {
            subscription.setCanceledAt(LocalDateTime.ofEpochSecond(canceledSubscription.getCanceledAt(), 0, ZoneOffset.UTC));
        }
        if (canceledSubscription.getEndedAt() != null) {
            subscription.setEndedAt(LocalDateTime.ofEpochSecond(canceledSubscription.getEndedAt(), 0, ZoneOffset.UTC));
        }
        subscriptionRepository.save(subscription);

        return new SubscriptionResponse(subscription);
    }

    /**
     * Gets the current user's subscription
     * 
     * @param userEmail Email of the authenticated user
     * @return Optional SubscriptionResponse
     */
    public Optional<SubscriptionResponse> getCurrentSubscription(String userEmail) {
        Optional<Subscription> subscription = subscriptionRepository.findByUserEmailAndStatus(userEmail, "active");
        return subscription.map(SubscriptionResponse::new);
    }


    /**
     * Get or create a Stripe customer for the user
     * 
     * @param email User email
     * @param name User name
     * @return Stripe Customer object
     * @throws StripeException if Stripe API call fails
     */
    private Customer getOrCreateCustomer(String email, String name) throws StripeException {
        // Search for existing customer by email
        CustomerSearchParams searchParams = CustomerSearchParams.builder()
            .setQuery("email:'" + email + "'")
            .build();
        
        var customers = Customer.search(searchParams);
        
        if (!customers.getData().isEmpty()) {
            return customers.getData().get(0);
        }

        // Create new customer
        CustomerCreateParams customerParams = CustomerCreateParams.builder()
            .setEmail(email)
            .setName(name)
            .build();

        return Customer.create(customerParams);
    }

    /**
     * Save Stripe subscription to local database
     * 
     * @param stripeSubscription Stripe subscription object
     * @param userEmail User email
     * @param planName Plan name
     * @param price Stripe price object
     * @return Saved Subscription entity
     */
    private Subscription saveSubscriptionToDatabase(com.stripe.model.Subscription stripeSubscription, 
                                                   String userEmail, String planName, Price price) {
        BigDecimal amount = new BigDecimal(price.getUnitAmount()).divide(new BigDecimal(100)); // Convert from cents
        
        LocalDateTime periodStart = null;
        LocalDateTime periodEnd = null;
        
        if (stripeSubscription.getCurrentPeriodStart() != null) {
            periodStart = LocalDateTime.ofEpochSecond(stripeSubscription.getCurrentPeriodStart(), 0, ZoneOffset.UTC);
        }
        if (stripeSubscription.getCurrentPeriodEnd() != null) {
            periodEnd = LocalDateTime.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd(), 0, ZoneOffset.UTC);
        }

        Subscription subscription = new Subscription(
            stripeSubscription.getId(),
            stripeSubscription.getCustomer(),
            price.getId(),
            userEmail,
            planName,
            amount,
            price.getCurrency().toUpperCase(),
            price.getRecurring().getInterval(),
            stripeSubscription.getStatus(),
            periodStart,
            periodEnd
        );

        return subscriptionRepository.save(subscription);
    }

    /**
     * Update subscription in database after Stripe update
     * 
     * @param subscription Local subscription entity
     * @param stripeSubscription Updated Stripe subscription
     * @param newPlanName New plan name
     * @param newPrice New Stripe price object
     */
    private void updateSubscriptionInDatabase(Subscription subscription, 
                                            com.stripe.model.Subscription stripeSubscription,
                                            String newPlanName, Price newPrice) {
        BigDecimal newAmount = new BigDecimal(newPrice.getUnitAmount()).divide(new BigDecimal(100));
        
        subscription.setStripePriceId(newPrice.getId());
        subscription.setPlanName(newPlanName);
        subscription.setAmount(newAmount);
        subscription.setCurrency(newPrice.getCurrency().toUpperCase());
        subscription.setInterval(newPrice.getRecurring().getInterval());
        subscription.setStatus(stripeSubscription.getStatus());
        
        if (stripeSubscription.getCurrentPeriodStart() != null) {
            subscription.setCurrentPeriodStart(LocalDateTime.ofEpochSecond(stripeSubscription.getCurrentPeriodStart(), 0, ZoneOffset.UTC));
        }
        if (stripeSubscription.getCurrentPeriodEnd() != null) {
            subscription.setCurrentPeriodEnd(LocalDateTime.ofEpochSecond(stripeSubscription.getCurrentPeriodEnd(), 0, ZoneOffset.UTC));
        }

        subscriptionRepository.save(subscription);
    }

    /**
     * Create a custom price for subscription with custom amount
     * 
     * @param amount Custom amount in euros
     * @param currency Currency code (e.g., "eur")
     * @return Stripe Price object
     * @throws StripeException if Stripe API call fails
     */
    private Price createCustomPrice(BigDecimal amount, String currency) throws StripeException {
        // Convert amount to cents
        long amountInCents = amount.multiply(new BigDecimal(100)).longValue();
        
        // Create price using the configured product ID
        com.stripe.param.PriceCreateParams priceParams = com.stripe.param.PriceCreateParams.builder()
            .setProduct(stripeProductId) // Use the configured product ID
            .setUnitAmount(amountInCents)
            .setCurrency(currency)
            .setRecurring(com.stripe.param.PriceCreateParams.Recurring.builder()
                .setInterval(com.stripe.param.PriceCreateParams.Recurring.Interval.MONTH)
                .build())
            .build();
        
        return Price.create(priceParams);
    }

    /**
     * Update subscription status to active in database after successful payment
     * 
     * @param subscriptionId Database ID of the subscription to activate
     * @return Updated SubscriptionResponse
     */
    public SubscriptionResponse activateSubscription(Long subscriptionId) {
        // Find subscription by ID
        Optional<Subscription> subscriptionOpt = subscriptionRepository.findById(subscriptionId);
        
        if (subscriptionOpt.isEmpty()) {
            throw new IllegalStateException("Subscription not found with ID: " + subscriptionId);
        }

        Subscription subscription = subscriptionOpt.get();
        
        // Check if subscription is already active
        if ("active".equals(subscription.getStatus())) {
            return new SubscriptionResponse(subscription);
        }
        
        // Update subscription status to active
        subscription.setStatus("active");
        subscriptionRepository.save(subscription);

        return new SubscriptionResponse(subscription);
    }
}