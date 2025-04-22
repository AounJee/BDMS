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
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String bloodType;
    
    private LocalDate lastDonationDate;
    
    @Column(nullable = false)
    private boolean eligibleToDonate = true;
    
    // Additional donor-specific fields can be added here
}