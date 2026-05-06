package com.multiwiki.user;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.multiwiki.Image.Image;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name ="users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @NotBlank
    @Email
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "role", nullable = false, columnDefinition = "VARCHAR(16) DEFAULT 'USER'")
    private String role;


    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "avatarId", referencedColumnName = "id")
    private Image avatar;


    @Column(name = "createdAt", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Column(name = "updatedAt")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;    

    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(16) DEFAULT 'ACTIVE'")
    private String status;

    @Column(name = "pendingNewEmail")
    private String pendingNewEmail;

    @Column(name = "emailChangeCodeHash")
    private String emailChangeCodeHash;

    @Column(name = "emailChangeCodeExpiry")
    private LocalDateTime emailChangeCodeExpiry;

    @Column(name = "registrationCodeHash")
    private String registrationCodeHash;

    @Column(name = "registrationCodeExpiry")
    private LocalDateTime registrationCodeExpiry;

    @Column(name = "passwordResetCodeHash")
    private String passwordResetCodeHash;

    @Column(name = "passwordResetCodeExpiry")
    private LocalDateTime passwordResetCodeExpiry;

    @Transient
    private boolean enabled = true;
    @Transient
    private boolean accountNonExpired = true;
    @Transient
    private boolean accountNonLocked = true;
    @Transient
    private boolean credentialsNonExpired = true;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) 
            this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) 
            this.updatedAt = LocalDateTime.now();
        if(this.role == null)
            this.role = EnumUserRole.USER.name();
        if(this.status == null)
            this.status = EnumUserStatus.UNCONFIRMED.name();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public boolean isAccountNonExpired(){
        return accountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public void setRole(EnumUserRole role){
        this.role = role.name();
    }

    public void setStatus(EnumUserStatus status){
        this.status = status.name();
    }

    public boolean isAdmin(){
        return this.role.equals(EnumUserRole.ADMIN.name());
    }

    public boolean isConfirmed(){ 
        return !this.status.equals(EnumUserStatus.UNCONFIRMED.name());
    }
}
