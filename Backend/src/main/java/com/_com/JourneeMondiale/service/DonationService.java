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
        return getDonationStatistics(null, null);
    }

    // Get donation statistics with date filtering
    public Map<String, Object> getDonationStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> stats = new HashMap<>();
        
        if (startDate != null || endDate != null) {
            // Get filtered statistics by date range
            List<Donation> filteredDonations = donationRepository.findByCreatedAtBetween(
                startDate != null ? startDate : LocalDateTime.of(1970, 1, 1, 0, 0),
                endDate != null ? endDate : LocalDateTime.now()
            );
            
            // Calculate statistics from filtered donations
            long totalCount = filteredDonations.stream()
                .filter(d -> "succeeded".equals(d.getStatus()))
                .count();
            
            BigDecimal totalAmount = filteredDonations.stream()
                .filter(d -> "succeeded".equals(d.getStatus()))
                .map(Donation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            double averageAmount = totalCount > 0 ? totalAmount.doubleValue() / totalCount : 0.0;
            
            stats.put("totalCount", totalCount);
            stats.put("totalAmount", totalAmount);
            stats.put("averageAmount", averageAmount);
            
            // Get status counts from filtered donations
            stats.put("succeededCount", filteredDonations.stream()
                .filter(d -> "succeeded".equals(d.getStatus())).count());
            stats.put("pendingCount", filteredDonations.stream()
                .filter(d -> "pending".equals(d.getStatus())).count());
            stats.put("failedCount", filteredDonations.stream()
                .filter(d -> "failed".equals(d.getStatus())).count());
            
            // Get amounts by status from filtered donations
            stats.put("succeededAmount", filteredDonations.stream()
                .filter(d -> "succeeded".equals(d.getStatus()))
                .map(Donation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
            stats.put("pendingAmount", filteredDonations.stream()
                .filter(d -> "pending".equals(d.getStatus()))
                .map(Donation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
            stats.put("failedAmount", filteredDonations.stream()
                .filter(d -> "failed".equals(d.getStatus()))
                .map(Donation::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        } else {
            // Get basic statistics (original logic)
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
                stats.put("averageAmount", BigDecimal.ZERO);
            }
            
            // Get total amount by status
            stats.put("succeededAmount", donationRepository.getTotalAmountByStatus("succeeded"));
            stats.put("pendingAmount", donationRepository.getTotalAmountByStatus("pending"));
            stats.put("failedAmount", donationRepository.getTotalAmountByStatus("failed"));
            
            // Get count by status
            stats.put("succeededCount", donationRepository.findByStatus("succeeded").size());
            stats.put("pendingCount", donationRepository.findByStatus("pending").size());
            stats.put("failedCount", donationRepository.findByStatus("failed").size());
        }
        
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

    // Get user donation statistics
    public Map<String, Object> getUserDonationStatistics(String donorEmail) {
        Map<String, Object> stats = new HashMap<>();
        
        List<Donation> userDonations = donationRepository.findByDonorEmailOrderByCreatedAtDesc(donorEmail);
        
        // Calculate statistics
        long totalCount = userDonations.size();
        BigDecimal totalAmount = userDonations.stream()
            .filter(d -> "succeeded".equals(d.getStatus()))
            .map(Donation::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long succeededCount = userDonations.stream()
            .filter(d -> "succeeded".equals(d.getStatus()))
            .count();
        
        long pendingCount = userDonations.stream()
            .filter(d -> "pending".equals(d.getStatus()))
            .count();
        
        long failedCount = userDonations.stream()
            .filter(d -> "failed".equals(d.getStatus()))
            .count();
        
        stats.put("totalCount", totalCount);
        stats.put("totalAmount", totalAmount);
        stats.put("succeededCount", succeededCount);
        stats.put("pendingCount", pendingCount);
        stats.put("failedCount", failedCount);
        
        // Get most recent donation
        if (!userDonations.isEmpty()) {
            stats.put("lastDonation", userDonations.get(0));
        }
        
        return stats;
    }
}
