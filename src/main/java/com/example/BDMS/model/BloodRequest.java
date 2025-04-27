package com.example.BDMS.model;

import lombok.Data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "blood_requests")
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hospital_name", nullable = false)
    private String hospitalName;

    @Column(name = "blood_type", nullable = false)
    private String bloodType;

    @Column(name = "units_needed", nullable = false)
    private Integer unitsNeeded;

    @Column(nullable = false)
    private String urgency;

    @Column(name = "request_date")
    private LocalDateTime requestDate;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_phone")
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(nullable = false)
    private String status;

    private String notes;

    @Transient
    private String hospital;

    @Transient
    private String postedTime;

    @Transient
    private String distance;
}