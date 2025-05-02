package com.example.BDMS.controller;

import com.example.BDMS.dto.RegisterRequest;
import com.example.BDMS.model.Role;
import com.example.BDMS.model.User;
import com.example.BDMS.model.Donor;
import com.example.BDMS.repository.UserRepository;
import com.example.BDMS.repository.DonorRepository;
import lombok.RequiredArgsConstructor;

import java.security.Principal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5000", allowCredentials = "true")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            // Validate blood type
            if (request.getBloodType() == null || request.getBloodType().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Blood type is required"));
            }

            // Check if email exists
            User user = userRepository.findByEmail(request.getEmail()).orElse(null);
            if (user != null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already exists"));
            }

            // Parse DOB
            LocalDate dobParsed = (request.getDob() != null && !request.getDob().isEmpty()) ?
                    LocalDate.parse(request.getDob(), DateTimeFormatter.ISO_LOCAL_DATE) : null;

            // Create and save user
            User newUser = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .username(request.getUsername())
                    .dob(dobParsed)
                    .gender(request.getGender())
                    .role(Role.DONOR) // Always set to DONOR for website registrations
                    .build();

            userRepository.save(newUser);

            // Create and save donor record
            Donor donor = new Donor();
            donor.setUserId(newUser.getId());
            donor.setBloodType(request.getBloodType());
            donor.setEligibleToDonate(true);
            donor.setTotalDonations(0);
            donorRepository.save(donor);

            return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "userId", newUser.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<User> checkAuth(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(user);
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateProfile(
            @RequestParam("email") String email,
            @RequestParam("username") String username,
            @RequestParam(value = "password", required = false) String password,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setEmail(email);
            user.setUsername(username);
            if (password != null && !password.isEmpty()) {
                user.setPassword(passwordEncoder.encode(password));
            }

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}