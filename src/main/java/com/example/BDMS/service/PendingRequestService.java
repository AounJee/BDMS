package com.example.BDMS.service;

import com.example.BDMS.model.BloodRequest;
import com.example.BDMS.model.Donor;
import com.example.BDMS.model.PendingRequest;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.BloodRequestRepository;
import com.example.BDMS.repository.DonorRepository;
import com.example.BDMS.repository.PendingRequestRepository;
import com.example.BDMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PendingRequestService {

    private final PendingRequestRepository pendingRequestRepository;
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;

    public List<PendingRequest> getUserPendingRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        return pendingRequestRepository.findByDonorId(donor.getId());
    }

    public void applyToRequest(Long requestId,String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!donor.getBloodType().equals(request.getBloodType())) {
            throw new RuntimeException("Blood type mismatch");
        }
        if (!donor.isEligibleToDonate()) {
            throw new RuntimeException("Donor is not eligible to donate");
        }
        PendingRequest pendingRequest = new PendingRequest();
        pendingRequest.setDonor(donor);
        pendingRequest.setBloodRequest(request);
        pendingRequest.setAppliedTime(LocalDateTime.now());
        pendingRequest.setStatus("PENDING");
        pendingRequestRepository.save(pendingRequest);
    }
}