package com.example.BDMS.repository;

import com.example.BDMS.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    
    // New methods needed
    Optional<Donor> findByUserId(Long userId);
    
    @Query("SELECT d.totalDonations FROM Donor d WHERE d.userId = :userId")
    int countDonationsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Donor d SET d.totalDonations = d.totalDonations + 1 WHERE d.id = :donorId")
    void incrementDonationCount(@Param("donorId") Long donorId);
}