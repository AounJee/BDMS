package com.example.BDMS.service;

import com.example.BDMS.dto.DonorResponse;
import com.example.BDMS.exception.ResourceNotFoundException;
import com.example.BDMS.model.Donor;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.DonorRepository;
import com.example.BDMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.boot.autoconfigure.security.saml2.Saml2RelyingPartyProperties.Decryption;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DonorService {
    
    private final DonorRepository donorRepository;
    private final UserRepository userRepository;

public DonorResponse getDonorProfile(Long userId) {
    // Find user by ID
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    
    // Find donor profile by user ID
    Donor donor = donorRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for user id: " + userId));
    
    // Calculate additional stats
    String lastDonationText = donor.getLastDonationDate() != null ? 
            formatLastDonationDate(donor.getLastDonationDate()) : "Never donated";
    
    String nextEligibleText = calculateNextEligible(donor.getLastDonationDate());
    int totalDonations = donorRepository.countDonationsByUserId(userId);
    
    return DonorResponse.builder()
            .userId(user.getId())
            .name(user.getFirstName() + " " + user.getLastName())
            .email(user.getEmail())
            .bloodType(donor.getBloodType())
            .lastDonationDate(donor.getLastDonationDate())
            .lastDonationText(lastDonationText)
            .nextEligibleText(nextEligibleText)
            .totalDonations(totalDonations)
            .eligibleToDonate(donor.isEligibleToDonate())
            .build();
}

private String formatLastDonationDate(LocalDate lastDonationDate) {
    long daysBetween = ChronoUnit.DAYS.between(lastDonationDate, LocalDate.now());
    if (daysBetween < 30) {
        return daysBetween + " days ago";
    } else {
        long monthsBetween = ChronoUnit.MONTHS.between(lastDonationDate, LocalDate.now());
        return monthsBetween + " months ago";
    }
}

private String calculateNextEligible(LocalDate lastDonationDate) {
    if (lastDonationDate == null) {
        return "Eligible now";
    }
    
    LocalDate nextEligibleDate = lastDonationDate.plusDays(56); // 8 weeks
    long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), nextEligibleDate);
    
    if (daysRemaining <= 0) {
        return "Eligible now";
    } else {
        return daysRemaining + " days";
    }
}

public void recordDonation(Long donorId, Decryption donation) {
    Donor donor = donorRepository.findById(donorId)
            .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
    
    donor.setLastDonationDate(LocalDate.now());
    donor.setEligibleToDonate(false); // Temporary ineligibility
    donorRepository.incrementDonationCount(donorId);
    
    // Business logic for eligibility (e.g., becomes eligible after 8 weeks)
    if (donor.getLastDonationDate().plusWeeks(8).isBefore(LocalDate.now())) {
        donor.setEligibleToDonate(true);
    }
    
    donorRepository.save(donor);
}
}