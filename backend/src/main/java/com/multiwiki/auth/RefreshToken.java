package com.multiwiki.auth;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.multiwiki.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "refreshTokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @Column(name = "expiresAt", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    @CreationTimestamp
    @Column(name = "createdAt", updatable = false, nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "lastUsedAt", nullable = false)
    private LocalDateTime lastUsedAt;

    @Column(name = "lastIpAddress", nullable = false, length = 45)
    private String lastIpAddress;

    @Column(name = "userAgent", nullable = false, length = 500)
    private String userAgent;

    @Column(name = "deviceFingerprint", nullable = false, length = 64)
    private String deviceFingerprint;

    @PrePersist
    protected void onCreate() {
        this.revoked = false;
        this.lastUsedAt = LocalDateTime.now();
    }
}
