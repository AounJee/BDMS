package com.example.BDMS.controller;

import com.example.BDMS.model.BloodRequest;
import com.example.BDMS.service.BloodRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blood-requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestService bloodRequestService;

    @GetMapping
    public ResponseEntity<List<BloodRequest>> getAllOpenRequests() {
        return ResponseEntity.ok(bloodRequestService.getAllOpenRequests());
    }
}