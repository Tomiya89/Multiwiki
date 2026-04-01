package com.multiwiki.auth.services;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.multiwiki.auth.EnumAuthErrorResponse;
import com.multiwiki.auth.requests.RegisterRequest;
import com.multiwiki.auth.responses.AuthErrorResponse;
import com.multiwiki.common.responses.Response;
import com.multiwiki.common.services.EmailService;
import com.multiwiki.user.EnumUserStatus;
import com.multiwiki.user.User;
import com.multiwiki.user.UserService;

import jakarta.transaction.Transactional;

@Service
public class RegistrationService {
    @Autowired
    private UserService userService;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private EmailService emailService;

    @Value("${change.mail.expiry-minutes}")
    private int expiryMinutes;

    @Transactional
    public ResponseEntity<?> initiateRegistration(RegisterRequest request) {
        Optional<User> existingUserOpt = userService.getByEmail(request.getEmail());

        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.isEnabled()) { 
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthErrorResponse(EnumAuthErrorResponse.EMAIL_ALREADY_EXISTS));
            }

            user.setUsername(request.getUsername());
            user.setPassword(passwordService.hashPasword(request.getPassword()));
            user.setCreatedAt(LocalDateTime.now()); 
            userService.updateUser(user);
        } else {
            user = this.userService.createUser(request.getUsername(), request.getEmail(), request.getPassword());
            userService.updateUser(user);
        }

        String code = String.format("%06d", new Random().nextInt(999999));
        
        user.setRegistrationCodeHash(passwordService.hashPasword(code));
        user.setRegistrationCodeExpiry(LocalDateTime.now().plusMinutes(expiryMinutes));
        
        try {
            emailService.sendRegistrationCode(user.getEmail(), code);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AuthErrorResponse(EnumAuthErrorResponse.FAILED_TO_SEND_MAIL));
        }

        return ResponseEntity.ok(new Response());
    }

    @Transactional
    public User confirmRegistration(String email, String code) throws Exception {
        User user = userService.getByEmail(email)
            .orElseThrow(() -> new Exception("USER_NOT_FOUND"));

        if (user.isConfirmed())
            throw new Exception("USER_NOT_FOUND");

        if (user.getRegistrationCodeHash() == null || 
            user.getRegistrationCodeExpiry() == null ||
            user.getRegistrationCodeExpiry().isBefore(LocalDateTime.now()) ||
            !passwordService.checkPassword(code, user.getRegistrationCodeHash())) {
            
            throw new Exception("CODE_INVALID");
        }

        user.setStatus(EnumUserStatus.ACTIVE);
        user.setRegistrationCodeHash(null);
        user.setRegistrationCodeExpiry(null);
        
        return userService.updateUser(user);
    }
}