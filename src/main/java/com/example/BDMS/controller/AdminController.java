package com.example.BDMS.controller;

import com.example.BDMS.model.*;
import com.example.BDMS.repository.*;
import com.example.BDMS.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final DonationService donationService;
    private final PendingRequestService pendingRequestService;
    private final BloodRequestService bloodRequestService;
    private final AppointmentService appointmentService;

    // 1. Dashboard stats
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalDonors = donorRepository.count();
        long totalDonations = donationService.countAllDonations();
        long pendingRequests = pendingRequestService.countPendingRequests();
        long upcomingAppointments = appointmentService.countUpcomingAppointments();
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalDonors", totalDonors);
        stats.put("totalDonations", totalDonations);
        stats.put("pendingRequests", pendingRequests);
        stats.put("upcomingAppointments", upcomingAppointments);
        return ResponseEntity.ok(stats);
    }

    // 2. Pending donor requests
    @GetMapping("/pending-requests")
    public ResponseEntity<List<PendingRequest>> getAllPendingRequests() {
        return ResponseEntity.ok(pendingRequestService.getAllPendingRequests());
    }

    @PostMapping("/pending-requests/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        pendingRequestService.approveRequest(id);
        return ResponseEntity.ok(Map.of("message", "Request approved"));
    }

    @PostMapping("/pending-requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        pendingRequestService.rejectRequest(id);
        return ResponseEntity.ok(Map.of("message", "Request rejected"));
    }

    // 3. Blood requests
    @GetMapping("/blood-requests")
    public ResponseEntity<List<BloodRequest>> getAllBloodRequests() {
        return ResponseEntity.ok(bloodRequestService.getAllRequests());
    }

    @PostMapping("/blood-requests")
    public ResponseEntity<?> createBloodRequest(@RequestBody BloodRequest request) {
        bloodRequestService.createRequest(request);
        return ResponseEntity.ok(Map.of("message", "Blood request created"));
    }

    // 4. Donations
    @GetMapping("/donations")
    public ResponseEntity<List<Donation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    // 5. Admin profile
    @GetMapping("/profile")
    public ResponseEntity<User> getAdminProfile(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody Map<String, String> payload, Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body(Map.of("message", "User not found"));
        user.setFirstName(payload.getOrDefault("firstName", user.getFirstName()));
        user.setLastName(payload.getOrDefault("lastName", user.getLastName()));
        user.setEmail(payload.getOrDefault("email", user.getEmail()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated"));
    }
} 