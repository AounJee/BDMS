package com.example.BDMS.controller;

import com.example.BDMS.dto.AppointmentRequest;
import com.example.BDMS.model.Appointment;
import com.example.BDMS.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/me")
    public ResponseEntity<List<Appointment>> getUserAppointments(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(appointmentService.getUserAppointments(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<?> scheduleAppointment(@RequestBody AppointmentRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            Appointment appointment = appointmentService.scheduleAppointment(principal.getName(), request);
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> rescheduleAppointment(@PathVariable Long id, @RequestBody AppointmentRequest request, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            Appointment appointment = appointmentService.rescheduleAppointment(id, request, principal.getName());
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelAppointment(@PathVariable Long id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            appointmentService.cancelAppointment(id, principal.getName());
            return ResponseEntity.ok(Map.of("message", "Appointment cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}