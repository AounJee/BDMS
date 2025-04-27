package com.example.BDMS.controller;

import com.example.BDMS.dto.DonorResponse;
import com.example.BDMS.model.Appointment;
import com.example.BDMS.model.Donation;
import com.example.BDMS.model.PendingRequest;
import com.example.BDMS.model.User; // Explicitly import your User class
import com.example.BDMS.repository.UserRepository;
import com.example.BDMS.service.AppointmentService;
import com.example.BDMS.service.DonationService;
import com.example.BDMS.service.DonorService;
import com.example.BDMS.service.PendingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;
    private final AppointmentService appointmentService;
    private final DonationService donationService;
    private final PendingRequestService pendingRequestService;
    private final UserRepository userRepository;

    @GetMapping("/{userId}/profile")
    public ResponseEntity<DonorResponse> getDonorProfile(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(donorService.getDonorProfile(userId));
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<DonorResponse> getDonorStats(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(donorService.getDonorProfile(userId));
    }

    @GetMapping("/{userId}/appointments")
    public ResponseEntity<List<Appointment>> getAppointments(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(appointmentService.getUserAppointments(principal.getName()));
    }

    @GetMapping("/{userId}/history")
    public ResponseEntity<List<Donation>> getHistory(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(donationService.getUserDonations(principal.getName()));
    }

    @GetMapping("/{userId}/pending-requests")
    public ResponseEntity<List<PendingRequest>> getPendingRequests(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(pendingRequestService.getUserPendingRequests(principal.getName()));
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyToDonate(@RequestBody Map<String, Long> body, Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            pendingRequestService.applyToRequest(body.get("requestId"), principal.getName());
            return ResponseEntity.ok(Map.of("message", "Application submitted", "userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}