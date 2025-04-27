package com.example.BDMS.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private Long centerId;
    private LocalDateTime appointmentDate;
    private String notes;
}