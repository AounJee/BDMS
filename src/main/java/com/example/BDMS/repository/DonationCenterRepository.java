package com.example.BDMS.repository;

import com.example.BDMS.model.DonationCenter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DonationCenterRepository extends JpaRepository<DonationCenter, Long> {
    Optional<DonationCenter> findByName(String name);
}