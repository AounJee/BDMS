package com.example.BDMS.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String firstName;
    private String lastName;
    @NotBlank
    private String username; // Add this
    private String dob;
    private String gender;
    private String email;
    private String password;
    private String bloodType;
}