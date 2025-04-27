package com.example.BDMS.controller;

import com.example.BDMS.model.PendingRequest;
import com.example.BDMS.service.PendingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pending-requests")
@RequiredArgsConstructor
public class PendingRequestController {

    private final PendingRequestService pendingRequestService;

    @GetMapping("/me")
    public ResponseEntity<List<PendingRequest>> getUserPendingRequests(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(pendingRequestService.getUserPendingRequests(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<?> applyToRequest(@RequestBody Map<String, Long> body, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            pendingRequestService.applyToRequest(body.get("requestId"), principal.getName());
            return ResponseEntity.ok(Map.of("message", "Application submitted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}