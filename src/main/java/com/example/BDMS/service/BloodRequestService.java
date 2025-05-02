package com.example.BDMS.service;

import com.example.BDMS.model.BloodRequest;
import com.example.BDMS.repository.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;

    public List<BloodRequest> getAllOpenRequests() {
        return bloodRequestRepository.findByStatus("OPEN");
    }

    public List<BloodRequest> getAllRequests() {
        return bloodRequestRepository.findAll();
    }

    public void createRequest(BloodRequest request) {
        bloodRequestRepository.save(request);
    }
}