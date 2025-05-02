package com.example.BDMS.service;

import com.example.BDMS.model.Donation;
import com.example.BDMS.model.Donor;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.DonationRepository;
import com.example.BDMS.repository.DonorRepository;
import com.example.BDMS.repository.UserRepository;
import com.example.BDMS.repository.DonationCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final DonationCenterRepository donationCenterRepository;

    public List<Donation> getUserDonations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        return donationRepository.findByDonorId(donor.getId()).stream()
                .map(donation -> {
                    donation.setHospital(donationCenterRepository.findById(donation.getCenterId())
                            .map(center -> center.getName())
                            .orElse("Unknown"));
                    return donation;
                })
                .collect(Collectors.toList());
    }

    public long countAllDonations() {
        return donationRepository.count();
    }

    public List<Donation> getAllDonations() {
        List<Donation> donations = donationRepository.findAll();
        for (Donation donation : donations) {
            Donor donor = donation.getDonor();
            if (donor != null) {
                // Fetch the user for the donor
                User user = userRepository.findById(donor.getUserId()).orElse(null);
                if (user != null) {
                    donation.setDonorName(user.getFirstName() + " " + user.getLastName());
                }
            }
        }
        return donations;
    }
}