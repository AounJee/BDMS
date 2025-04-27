package com.example.BDMS.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = true, unique = true)
    private String username;

    private String dob;
    private String gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Role role;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Donor donor;

    public void setProfilePicUrl(String profilePicUrl) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'setProfilePicUrl'");
    }

    public long getId() {
        return id;
    }
}