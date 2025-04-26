package com.example.BDMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DonorResponse {
    private Long userId;
    private String name;
    private String email;
    private String bloodType;
    private LocalDate lastDonationDate;
    private String lastDonationText;
    private String nextEligibleText;
    private int totalDonations;
    private boolean eligibleToDonate;
}