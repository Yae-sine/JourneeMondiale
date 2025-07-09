package com._com.JourneeMondiale.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String paymentIntentId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private String donorName;

    @Column(nullable = false)
    private String donorEmail;

    private String description;

    @Column(nullable = false)
    private String status; // succeeded, failed, pending

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Constructor for easy creation
    public Donation(String paymentIntentId, BigDecimal amount, String currency, 
                   String donorName, String donorEmail, String description, String status) {
        this.paymentIntentId = paymentIntentId;
        this.amount = amount;
        this.currency = currency;
        this.donorName = donorName;
        this.donorEmail = donorEmail;
        this.description = description;
        this.status = status;
    }
}
