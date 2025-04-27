package com.example.BDMS.controller;

import com.example.BDMS.model.Donation;
import com.example.BDMS.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    @GetMapping("/me")
    public ResponseEntity<List<Donation>> getUserDonations(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(donationService.getUserDonations(principal.getName()));
    }
}