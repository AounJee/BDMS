package com.example.BDMS.dto;

import com.example.BDMS.model.Donor;
import com.example.BDMS.model.User;
import lombok.Data;
import java.time.LocalDate;

@Data
public class DonorResponse {
    private Long id;
    private String email;
    private String username;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String bloodType;
    private LocalDate lastDonationDate;
    private Boolean eligibleToDonate;
    private Integer totalDonations;

    public DonorResponse(User user, Donor donor) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.username = user.getUsername();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.dob = user.getDob();
        this.gender = user.getGender();
        this.bloodType = donor.getBloodType();
        this.lastDonationDate = donor.getLastDonationDate();
        this.eligibleToDonate = donor.getEligibleToDonate();
        this.totalDonations = donor.getTotalDonations();
    }
}