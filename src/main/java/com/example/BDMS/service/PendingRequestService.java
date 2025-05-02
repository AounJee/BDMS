package com.example.BDMS.service;

import com.example.BDMS.model.Appointment;
import com.example.BDMS.model.BloodRequest;
import com.example.BDMS.model.Donor;
import com.example.BDMS.model.PendingRequest;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.AppointmentRepository;
import com.example.BDMS.repository.BloodRequestRepository;
import com.example.BDMS.repository.DonorRepository;
import com.example.BDMS.repository.PendingRequestRepository;
import com.example.BDMS.repository.UserRepository;
import com.example.BDMS.repository.DonationCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PendingRequestService {

    private final PendingRequestRepository pendingRequestRepository;
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final AppointmentRepository appointmentRepository;
    private final DonationCenterRepository donationCenterRepository;

    public List<PendingRequest> getUserPendingRequests(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        return pendingRequestRepository.findByDonorId(donor.getId());
    }

    public void applyToRequest(Long requestId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));

        // Enforce only one pending request per donor
        boolean hasPending = pendingRequestRepository.existsByDonorIdAndStatus(donor.getId(), "PENDING");
        if (hasPending) {
            throw new RuntimeException("You already have a pending request.");
        }

        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!donor.getBloodType().equals(request.getBloodType())) {
            throw new RuntimeException("Blood type mismatch");
        }
        if (!donor.getEligibleToDonate()) {
            throw new RuntimeException("Donor is not eligible to donate");
        }
        PendingRequest pendingRequest = new PendingRequest();
        pendingRequest.setDonor(donor);
        pendingRequest.setBloodRequest(request);
        pendingRequest.setAppliedTime(LocalDateTime.now());
        pendingRequest.setStatus("PENDING");
        pendingRequestRepository.save(pendingRequest);
    }

    public void deletePendingRequest(Long id) {
        pendingRequestRepository.deleteById(id);
    }

    public long countPendingRequests() {
        return pendingRequestRepository.count();
    }

    public List<PendingRequest> getAllPendingRequests() {
        return pendingRequestRepository.findAll();
    }

    public void approveRequest(Long id) {
        PendingRequest request = pendingRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pending request not found"));
        request.setStatus("APPROVED");
        pendingRequestRepository.save(request);

        // Create an appointment for the donor
        Appointment appointment = new Appointment();
        appointment.setDonor(request.getDonor());
        String hospitalName = request.getBloodRequest().getHospitalName();
        Long centerId = donationCenterRepository.findByName(hospitalName)
            .map(center -> center.getId())
            .orElseThrow(() -> new RuntimeException("Donation center not found"));
        appointment.setCenterId(centerId);
        appointment.setAppointmentDate(LocalDateTime.now().plusDays(1)); // Or set a specific date/time
        appointment.setStatus("SCHEDULED");
        appointment.setNotes("Auto-created after admin approval");
        appointmentRepository.save(appointment);
    }

    public void rejectRequest(Long id) {
        PendingRequest request = pendingRequestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Pending request not found"));
        request.setStatus("REJECTED");
        pendingRequestRepository.save(request);
    }
}