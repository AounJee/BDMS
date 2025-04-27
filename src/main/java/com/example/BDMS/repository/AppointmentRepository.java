package com.example.BDMS.repository;

import com.example.BDMS.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDonorId(Long donorId);
}