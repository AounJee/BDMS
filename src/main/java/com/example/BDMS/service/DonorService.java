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
    
        return new DonorResponse(user, donor);
    }

    public DonorResponse updateProfile(Long userId, 
                                     String username, 
                                     String firstName, 
                                     String lastName, 
                                     String bloodType, 
                                     LocalDate dob, 
                                     String gender) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setDob(dob);
        user.setGender(gender);

        Donor donor = donorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor not found"));
        donor.setBloodType(bloodType);

        userRepository.save(user);
        donorRepository.save(donor);

        return new DonorResponse(user, donor);
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