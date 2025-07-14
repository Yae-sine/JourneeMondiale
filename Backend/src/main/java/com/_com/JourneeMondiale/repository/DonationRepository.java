package com._com.JourneeMondiale.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com._com.JourneeMondiale.model.Donation;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    
    Optional<Donation> findByPaymentIntentId(String paymentIntentId);
    
    List<Donation> findByDonorEmailOrderByCreatedAtDesc(String donorEmail);
    
    List<Donation> findByStatusOrderByCreatedAtDesc(String status);

    List<Donation> findByStatus(String status);
    
    // Find donations by donor name (case insensitive)
    List<Donation> findByDonorNameContainingIgnoreCase(String donorName);
    
    // Find donations within a date range
    List<Donation> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find donations by amount range
    List<Donation> findByAmountBetween(BigDecimal minAmount, BigDecimal maxAmount);
    
    // Get recent donations (last 30 days)
    @Query("SELECT d FROM Donation d WHERE d.createdAt >= :thirtyDaysAgo ORDER BY d.createdAt DESC")
    List<Donation> findRecentDonations(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    // Get top donations by amount
    @Query("SELECT d FROM Donation d WHERE d.status = 'succeeded' ORDER BY d.amount DESC")
    List<Donation> findTopDonationsByAmount(Pageable pageable);
    
    // Get total donation amount by status
    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.status = :status")
    BigDecimal getTotalAmountByStatus(@Param("status") String status);
    

    
    // Get donation statistics
    @Query("SELECT COUNT(d), SUM(d.amount), AVG(d.amount) FROM Donation d WHERE d.status = 'succeeded' ")
    Object getDonationStatistics();


    
    // Search donations by multiple criteria
    @Query("SELECT d FROM Donation d WHERE " +
           "(:donorName IS NULL OR LOWER(d.donorName) LIKE LOWER(CONCAT('%', :donorName, '%'))) AND " +
           "(:donorEmail IS NULL OR LOWER(d.donorEmail) LIKE LOWER(CONCAT('%', :donorEmail, '%'))) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:minAmount IS NULL OR d.amount >= :minAmount) AND " +
           "(:maxAmount IS NULL OR d.amount <= :maxAmount) AND " +
           "(:startDate IS NULL OR d.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR d.createdAt <= :endDate)")
    Page<Donation> searchDonations(
        @Param("donorName") String donorName,
        @Param("donorEmail") String donorEmail,
        @Param("status") String status,
        @Param("minAmount") BigDecimal minAmount,
        @Param("maxAmount") BigDecimal maxAmount,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );
}
