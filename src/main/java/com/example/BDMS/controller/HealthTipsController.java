package com.example.BDMS.controller;

import com.example.BDMS.model.HealthTip;
import com.example.BDMS.repository.HealthTipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/health-tips")
@RequiredArgsConstructor
public class HealthTipsController {

    private final HealthTipRepository healthTipRepository;

    @GetMapping
    public ResponseEntity<List<HealthTip>> getHealthTips(@RequestParam(required = false) String category) {
        if (category != null) {
            return ResponseEntity.ok(healthTipRepository.findByCategory(category));
        }
        return ResponseEntity.ok(healthTipRepository.findAll());
    }
}