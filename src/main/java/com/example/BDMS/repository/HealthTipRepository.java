package com.example.BDMS.repository;

import com.example.BDMS.model.HealthTip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HealthTipRepository extends JpaRepository<HealthTip, Long> {
    List<HealthTip> findByCategory(String category);
}