package com._com.JourneeMondiale.repository;

import com._com.JourneeMondiale.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    
    Optional<Donation> findByPaymentIntentId(String paymentIntentId);
    
    List<Donation> findByDonorEmailOrderByCreatedAtDesc(String donorEmail);
    
    List<Donation> findByStatusOrderByCreatedAtDesc(String status);
}
