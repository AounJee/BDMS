package com.example.BDMS.controller;

import com.example.BDMS.dto.RegisterRequest;
import com.example.BDMS.model.Role;
import com.example.BDMS.model.User;
import com.example.BDMS.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.security.Principal;
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
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5000", allowCredentials = "true")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity
                        .badRequest()
                        .body(Map.of("message", "Email already exists"));
            }

            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .username(request.getUsername())
                    .dob(request.getDob())
                    .gender(request.getGender())
                    .role(Role.DONOR)
                    .build();

            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "message", "Registration successful",
                "userId", user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
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
        @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
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
        if (profilePic != null && !profilePic.isEmpty()) {
            // Save the file and update profilePicUrl (implementation depends on your file storage solution)
            String profilePicUrl = saveProfilePicture(profilePic); // Implement this method
            user.setProfilePicUrl(profilePicUrl);
        }

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}

    private String saveProfilePicture(MultipartFile profilePic) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'saveProfilePicture'");
    }
}