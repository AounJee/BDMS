package com.example.BDMS.service;

import com.example.BDMS.dto.AuthenticationRequest;
import com.example.BDMS.dto.AuthenticationResponse;
import com.example.BDMS.dto.RegisterRequest;
import com.example.BDMS.model.Donor;
import com.example.BDMS.model.Role;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.DonorRepository;
import com.example.BDMS.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered.");    
        }
        
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .dob(request.getDob())
                .gender(request.getGender())
                .email(request.getEmail())
                .password(request.getPassword()) // Plain text for development
                .role(Role.DONOR)
                .build();

        userRepository.save(user);

        var donor = Donor.builder()
                .user(user)
                .bloodType(request.getBloodType())
                .eligibleToDonate(true)
                .build();

        donorRepository.save(donor);

        return AuthenticationResponse.builder()
                .message("Registration successful")
                .userId(user.getId())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    
        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return AuthenticationResponse.builder()
                .message("Login successful")
                .userId(user.getId())
                .build();
    }
}