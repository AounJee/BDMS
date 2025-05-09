package com.example.BDMS.controller;

import com.example.BDMS.dto.DonorResponse;
import com.example.BDMS.model.Appointment;
import com.example.BDMS.model.Donation;
import com.example.BDMS.model.PendingRequest;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.UserRepository;
import com.example.BDMS.service.AppointmentService;
import com.example.BDMS.service.DonationService;
import com.example.BDMS.service.DonorService;
import com.example.BDMS.service.PendingRequestService;
import com.example.BDMS.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

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
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(donorService.getDonorProfile(userId));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<DonorResponse> getMyProfile(Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(donorService.getDonorProfile(user.getId()));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<DonorResponse> updateProfile(@PathVariable Long userId,
                                                     @RequestParam String username,
                                                     @RequestParam String firstName,
                                                     @RequestParam String lastName,
                                                     @RequestParam String bloodType,
                                                     @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate dob,
                                                     @RequestParam String gender) {
        DonorResponse updatedProfile = donorService.updateProfile(userId, username, firstName, lastName, bloodType, dob, gender);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<DonorResponse> getDonorStats(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(donorService.getDonorProfile(userId));
    }

    @GetMapping("/{userId}/appointments")
    public ResponseEntity<List<Appointment>> getAppointments(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(appointmentService.getUserAppointments(principal.getName()));
    }

    @GetMapping("/{userId}/history")
    public ResponseEntity<List<Donation>> getHistory(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(donationService.getUserDonations(principal.getName()));
    }

    @GetMapping("/{userId}/pending-requests")
    public ResponseEntity<List<PendingRequest>> getPendingRequests(@PathVariable Long userId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(pendingRequestService.getUserPendingRequests(principal.getName()));
    }

    @PostMapping("/apply")
    public ResponseEntity<?> applyToDonate(@RequestBody Map<String, Long> body, Principal principal) {
        try {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            pendingRequestService.applyToRequest(body.get("requestId"), principal.getName());
            return ResponseEntity.ok(Map.of("message", "Application submitted", "userId", user.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateDonorProfile(@PathVariable Long userId, @RequestBody Map<String, Object> payload, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getId() != userId) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        try {
            String username = (String) payload.get("username");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String bloodType = (String) payload.get("bloodType");
            String dobStr = (String) payload.get("dob");
            String gender = (String) payload.get("gender");
            LocalDate dob = null;
            if (dobStr != null && !dobStr.isEmpty()) {
                dob = LocalDate.parse(dobStr);
            }
            DonorResponse updatedProfile = donorService.updateProfile(userId, username, firstName, lastName, bloodType, dob, gender);

            // Remove pending requests that do not match the new blood type
            List<PendingRequest> pendingRequests = pendingRequestService.getUserPendingRequests(user.getEmail());
            for (PendingRequest req : pendingRequests) {
                if (!bloodType.equals(req.getBloodRequest().getBloodType())) {
                    pendingRequestService.deletePendingRequest(req.getId());
                }
            }

            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully!",
                "profile", updatedProfile
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Handle validation errors (e.g., invalid blood type)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.badRequest().body(errors);
    }

    // Handle ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFoundException(ResourceNotFoundException ex) {
        return ResponseEntity.status(404).body(Map.of("message", ex.getMessage()));
    }

    // Handle RuntimeException (e.g., photo upload failures)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity.status(500).body(Map.of("message", "An error occurred: " + ex.getMessage()));
    }

    // Handle IllegalArgumentException (e.g., invalid date format)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("message", "Invalid input: " + ex.getMessage()));
    }
}