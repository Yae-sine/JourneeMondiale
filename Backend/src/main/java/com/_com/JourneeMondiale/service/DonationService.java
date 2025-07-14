package com._com.JourneeMondiale.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com._com.JourneeMondiale.model.Donation;
import com._com.JourneeMondiale.repository.DonationRepository;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    // Get all donations with pagination and sorting
    public Page<Donation> getAllDonations(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        return donationRepository.findAll(pageable);
    }

    // Get all donations without pagination
    public List<Donation> getAllDonations() {
        return donationRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    // Get donation by ID
    public Optional<Donation> getDonationById(Long id) {
        return donationRepository.findById(id);
    }

    // Get donation by payment intent ID
    public Optional<Donation> getDonationByPaymentIntentId(String paymentIntentId) {
        return donationRepository.findByPaymentIntentId(paymentIntentId);
    }

    // Create a new donation
    public Donation createDonation(Donation donation) {
        return donationRepository.save(donation);
    }

    // Update donation
    public Donation updateDonation(Long id, Donation donationDetails) {
        Optional<Donation> optionalDonation = donationRepository.findById(id);
        if (optionalDonation.isPresent()) {
            Donation donation = optionalDonation.get();
            donation.setAmount(donationDetails.getAmount());
            donation.setCurrency(donationDetails.getCurrency());
            donation.setDonorName(donationDetails.getDonorName());
            donation.setDonorEmail(donationDetails.getDonorEmail());
            donation.setDescription(donationDetails.getDescription());
            donation.setStatus(donationDetails.getStatus());
            return donationRepository.save(donation);
        }
        return null;
    }

    // Delete donation
    public boolean deleteDonation(Long id) {
        if (donationRepository.existsById(id)) {
            donationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Get donations by status
    public List<Donation> getDonationsByStatus(String status) {
        return donationRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    // Get donations by donor email
    public List<Donation> getDonationsByDonorEmail(String donorEmail) {
        return donationRepository.findByDonorEmailOrderByCreatedAtDesc(donorEmail);
    }

    // Get recent donations (last 30 days)
    public List<Donation> getRecentDonations() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return donationRepository.findRecentDonations(thirtyDaysAgo);
    }

    // Get recent donations with limit
    public List<Donation> getRecentDonations(int limit) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Donation> donations = donationRepository.findRecentDonations(thirtyDaysAgo);
        return donations.stream().limit(limit).toList();
    }

    // Get top donations by amount
    public List<Donation> getTopDonations(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return donationRepository.findTopDonationsByAmount(pageable);
    }

    // Get donation statistics
    public Map<String, Object> getDonationStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Get basic statistics
        Object[] result = (Object[]) donationRepository.getDonationStatistics();
        if (result != null && result.length >= 3) {
            Long count = (Long) result[0];
            BigDecimal sum = (BigDecimal) result[1];
            Double avg = ((Number) result[2]).doubleValue();
            stats.put("totalCount", count);
            stats.put("totalAmount", sum);
            stats.put("averageAmount", avg);
        } else {
            stats.put("totalCount", 0L);
            stats.put("totalAmount", BigDecimal.ZERO);
            stats.put("averageAmount", BigDecimal.ZERO);}
        
        
        // Get total amount by status
        stats.put("succeededAmount", donationRepository.getTotalAmountByStatus("succeeded"));
        stats.put("pendingAmount", donationRepository.getTotalAmountByStatus("pending"));
        stats.put("failedAmount", donationRepository.getTotalAmountByStatus("failed"));
        
        // Get count by status
        stats.put("succeededCount", donationRepository.findByStatus("succeeded").size());
        stats.put("pendingCount", donationRepository.findByStatus("pending").size());
        stats.put("failedCount", donationRepository.findByStatus("failed").size());
        
        return stats;
    }

    // Search donations with filters
    public Page<Donation> searchDonations(
            String donorName, 
            String donorEmail, 
            String status,
            BigDecimal minAmount, 
            BigDecimal maxAmount,
            LocalDateTime startDate, 
            LocalDateTime endDate,
            int page, 
            int size, 
            String sortBy, 
            String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return donationRepository.searchDonations(
            donorName, donorEmail, status, 
            minAmount, maxAmount, 
            startDate, endDate, 
            pageable
        );
    }

    // Get donations within date range
    public List<Donation> getDonationsInDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return donationRepository.findByCreatedAtBetween(startDate, endDate);
    }

    // Get donations by amount range
    public List<Donation> getDonationsByAmountRange(BigDecimal minAmount, BigDecimal maxAmount) {
        return donationRepository.findByAmountBetween(minAmount, maxAmount);
    }
}
