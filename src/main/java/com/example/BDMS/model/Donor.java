package com.example.BDMS.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "donors")
public class Donor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "blood_type", nullable = false)
    private String bloodType;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column(name = "eligible_to_donate")
    private Boolean eligibleToDonate = true;

    @Column(name = "total_donations")
    private Integer totalDonations = 0;

    @Column(name = "medical_conditions")
    private String medicalConditions;
}