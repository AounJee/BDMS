package com.example.BDMS.controller;

import com.example.BDMS.model.DonationCenter;
import com.example.BDMS.repository.DonationCenterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donation-centers")
@RequiredArgsConstructor
public class DonationCenterController {

    private final DonationCenterRepository donationCenterRepository;

    @GetMapping("/{id}")
    public ResponseEntity<DonationCenter> getDonationCenter(@PathVariable Long id) {
        return donationCenterRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}