package com.example.BDMS.service;

import com.example.BDMS.dto.DonorResponse;
import com.example.BDMS.exception.ResourceNotFoundException;
import com.example.BDMS.model.Donation;
import com.example.BDMS.model.Donor;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.DonationRepository;
import com.example.BDMS.repository.DonorRepository;
import com.example.BDMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class DonorService {
    
    private final DonorRepository donorRepository;
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;

    public DonorResponse getDonorProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    
        Donor donor = donorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for user id: " + userId));
    
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
    
        LocalDate nextEligibleDate = lastDonationDate.plusDays(56);
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), nextEligibleDate);
    
        if (daysRemaining <= 0) {
            return "Eligible now";
        } else {
            return daysRemaining + " days";
        }
    }

    public void recordDonation(Long donorId, Long centerId, int amountMl) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
    
        donor.setLastDonationDate(LocalDate.now());
        donor.setEligibleToDonate(false);
        donor.setTotalDonations(donor.getTotalDonations() + 1);
    
        donorRepository.save(donor);

        Donation donation = new Donation();
        donation.setDonor(donor);
        donation.setCenterId(centerId);
        donation.setDonationDate(LocalDateTime.now());
        donation.setAmountMl(amountMl);
        donation.setStatus("COMPLETED");
        donationRepository.save(donation);
    }
}