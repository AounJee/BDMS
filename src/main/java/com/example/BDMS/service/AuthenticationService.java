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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered.");
        }

        // Parse the dob String into LocalDate
        LocalDate dob = (request.getDob() != null && !request.getDob().isEmpty()) ?
                LocalDate.parse(request.getDob(), DateTimeFormatter.ISO_LOCAL_DATE) : null;
        
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .dob(dob)  // Now a LocalDate
                .gender(request.getGender())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
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
    
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return AuthenticationResponse.builder()
                .message("Login successful")
                .userId(user.getId())
                .build();
    }
}