package com._com.JourneeMondiale.controller;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com._com.JourneeMondiale.model.Donation;
import com._com.JourneeMondiale.model.User;
import com._com.JourneeMondiale.service.DonationService;
import com._com.JourneeMondiale.service.UserService;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DonationController {

    @Autowired
    private DonationService donationService;

    @Autowired
    private UserService userService;

    // Get all donations with pagination (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/")
    public ResponseEntity<Page<Donation>> getAllDonations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Page<Donation> donations = donationService.getAllDonations(page, size, sortBy, sortDir);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get all donations without pagination (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Donation>> getAllDonationsSimple() {
        try {
            List<Donation> donations = donationService.getAllDonations();
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get donation by ID (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
        try {
            Optional<Donation> donation = donationService.getDonationById(id);
            return donation.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get donation by payment intent ID (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/payment-intent/{paymentIntentId}")
    public ResponseEntity<Donation> getDonationByPaymentIntentId(@PathVariable String paymentIntentId) {
        try {
            Optional<Donation> donation = donationService.getDonationByPaymentIntentId(paymentIntentId);
            return donation.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get donations by status (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Donation>> getDonationsByStatus(@PathVariable String status) {
        try {
            List<Donation> donations = donationService.getDonationsByStatus(status);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get donations by donor email (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/donor/{email}")
    public ResponseEntity<List<Donation>> getDonationsByDonorEmail(@PathVariable String email) {
        try {
            List<Donation> donations = donationService.getDonationsByDonorEmail(email);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get recent donations (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/recent")
    public ResponseEntity<List<Donation>> getRecentDonations(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Donation> donations = donationService.getRecentDonations(limit);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get top donations by amount (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/top")
    public ResponseEntity<List<Donation>> getTopDonations(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Donation> donations = donationService.getTopDonations(limit);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get donation statistics (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getDonationStatistics() {
        try {
            Map<String, Object> stats = donationService.getDonationStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search donations with filters (Admin only)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<Page<Donation>> searchDonations(
            @RequestParam(required = false) String donorName,
            @RequestParam(required = false) String donorEmail,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Page<Donation> donations = donationService.searchDonations(
                donorName, donorEmail, status, 
                minAmount, maxAmount, 
                startDate, endDate, 
                page, size, sortBy, sortDir
            );
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get current user's donations
    @GetMapping("/my-donations")
    public ResponseEntity<List<Donation>> getCurrentUserDonations(Principal principal) {
        try {
            String username = principal.getName();
            User user = userService.getUserByUsername(username);
            String userEmail = user.getEmail();
            List<Donation> donations = donationService.getDonationsByDonorEmail(userEmail);
            return ResponseEntity.ok(donations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get current user's donation statistics
    @GetMapping("/my-donations/statistics")
    public ResponseEntity<Map<String, Object>> getCurrentUserDonationStatistics(Principal principal) {
        try {
            String username = principal.getName();
            User user = userService.getUserByUsername(username);
            String userEmail = user.getEmail();
            Map<String, Object> stats = donationService.getUserDonationStatistics(userEmail);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
