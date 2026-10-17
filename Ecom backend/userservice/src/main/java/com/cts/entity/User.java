// src/main/java/com/cts/entity/User.java (Modified onCreate for lastLogin)
package com.cts.entity;

import com.cts.enums.Role;
import com.cts.enums.MembershipLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "e_user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userID;

    // Basic Info
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;

    // Credentials
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // Roles
    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<Role> roles = new HashSet<>();

    // Security & Account Status
    private boolean isActive = true; // Soft delete
    private boolean isBlocked = false;

    private int loginAttempts = 0;
    private LocalDateTime blockedUntil;

    private String verificationToken;

    @Column(columnDefinition = "LONGTEXT") // Assuming you want to keep LONGTEXT for profileimg
    private String profileimg;

    // Ensure lastLogin is present in your User entity
    // If you MUST keep it NOT NULL in DB, initialize it here.
    // Otherwise, the `ALTER TABLE` is the cleaner solution.
    private LocalDateTime lastLogin;


    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // If last_login column MUST be NOT NULL in the database,
        // initialize it here for new users.
        // Otherwise, making the DB column NULLABLE is generally preferred.
        if (this.lastLogin == null) {
            this.lastLogin = LocalDateTime.now(); // Set to current time on creation
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
