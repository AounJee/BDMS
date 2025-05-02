package com.example.BDMS.repository;

import com.example.BDMS.model.PendingRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PendingRequestRepository extends JpaRepository<PendingRequest, Long> {
    List<PendingRequest> findByDonorId(Long donorId);

    boolean existsByDonorIdAndStatus(Long donorId, String status);

    boolean existsByBloodRequestIdAndStatus(Long bloodRequestId, String status);

    List<PendingRequest> findByDonorIdAndStatus(Long donorId, String status);
}