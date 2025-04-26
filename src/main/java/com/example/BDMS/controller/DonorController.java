package com.example.BDMS.controller;

import com.example.BDMS.dto.DonorResponse;
import com.example.BDMS.service.DonorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {
    
    private final DonorService donorService;

    // @GetMapping("/me")
    // public ResponseEntity<DonorResponse> getCurrentDonorProfile() {
    //     return ResponseEntity.ok(donorService.getCurrentDonorProfile());
    // }
        @GetMapping("/{userId}")
    public ResponseEntity<DonorResponse> getDonorProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(donorService.getDonorProfile(userId));
    }
}