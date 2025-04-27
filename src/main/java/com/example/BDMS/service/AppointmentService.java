package com.example.BDMS.service;

import com.example.BDMS.dto.AppointmentRequest;
import com.example.BDMS.model.Appointment;
import com.example.BDMS.model.Donor;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.AppointmentRepository;
import com.example.BDMS.repository.DonorRepository;
import com.example.BDMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;

    public List<Appointment> getUserAppointments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        return appointmentRepository.findByDonorId(donor.getId());
    }

    public Appointment scheduleAppointment(String email, AppointmentRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        if (!donor.isEligibleToDonate()) {
            throw new RuntimeException("Donor is not eligible to donate at this time");
        }
        Appointment appointment = new Appointment();
        appointment.setDonor(donor);
        appointment.setCenterId(request.getCenterId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStatus("SCHEDULED");
        appointment.setNotes(request.getNotes());
        return appointmentRepository.save(appointment);
    }

    public Appointment rescheduleAppointment(Long id, AppointmentRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (!appointment.getDonor().getId().equals(donor.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        appointment.setCenterId(request.getCenterId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setNotes(request.getNotes());
        return appointmentRepository.save(appointment);
    }

    public void cancelAppointment(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Donor donor = donorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Donor not found"));
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        if (!appointment.getDonor().getId().equals(donor.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        appointment.setStatus("CANCELLED");
        appointmentRepository.save(appointment);
    }
}