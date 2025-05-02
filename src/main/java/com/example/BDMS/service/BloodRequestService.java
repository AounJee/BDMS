package com.example.BDMS.service;

import com.example.BDMS.model.BloodRequest;
import com.example.BDMS.repository.BloodRequestRepository;
import com.example.BDMS.repository.PendingRequestRepository;
import com.example.BDMS.repository.DonationCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final PendingRequestRepository pendingRequestRepository;
    private final DonationCenterRepository donationCenterRepository;

    public List<BloodRequest> getAllOpenRequests() {
        List<BloodRequest> openRequests = bloodRequestRepository.findByStatus("OPEN");
        return openRequests.stream()
            .filter(request -> !pendingRequestRepository.existsByBloodRequestIdAndStatus(request.getId(), "APPROVED"))
            .toList();
    }

    public List<BloodRequest> getAllRequests() {
        return bloodRequestRepository.findAll();
    }

    public void createRequest(BloodRequest request) {
        // Validate that the hospital exists in donation centers
        if (!donationCenterRepository.findByName(request.getHospitalName()).isPresent()) {
            throw new RuntimeException("Invalid hospital name. Please select a valid donation center.");
        }
        bloodRequestRepository.save(request);
    }
}