package com.example.BDMS.model;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "donors")
public class Donor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String bloodType;
    
    private LocalDate lastDonationDate;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean eligibleToDonate = true;

    @Column(columnDefinition = "integer default 0")
    private Integer totalDonations;

    @OneToMany(mappedBy = "donor")
    private List<Donation> donations = new ArrayList<>();

    public void setUpdatedAt(LocalDateTime now) {
        
    }
}