package com.multiwiki.auth.services;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.multiwiki.auth.EnumAuthErrorResponse;
import com.multiwiki.auth.requests.ResetPasswordRequest;
import com.multiwiki.auth.responses.AuthErrorResponse;
import com.multiwiki.common.responses.Response;
import com.multiwiki.common.services.EmailService;
import com.multiwiki.user.User;
import com.multiwiki.user.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordResetService {
    private final UserService userService;
    private final PasswordService passwordService;
    private final EmailService emailService;

    @Value("${password.reset.expiry-minutes:10}")
    private int expiryMinutes;

    public ResponseEntity<?> initiatePasswordReset(String email) {
        User user = this.userService.getByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String code = String.format("%06d", new Random().nextInt(999999));
        
        user.setPasswordResetCodeHash(this.passwordService.hashPasword(code));
        user.setPasswordResetCodeExpiry(LocalDateTime.now().plusMinutes(expiryMinutes));
        this.userService.updateUser(user);

        try {
            this.emailService.sendPasswordResetCode(email, code);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        return ResponseEntity.ok(new Response());
    }

    public ResponseEntity<?> confirmPasswordReset(ResetPasswordRequest request) {
        User user = this.userService.getByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPasswordResetCodeHash() == null || 
            !this.passwordService.checkPassword(request.getCode(), user.getPasswordResetCodeHash())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.CODE_INVALID));
        }

        if (user.getPasswordResetCodeExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.CODE_INVALID));
        }

        user.setPassword(this.passwordService.hashPasword(request.getNewPassword()));
        user.setPasswordResetCodeHash(null);
        user.setPasswordResetCodeExpiry(null);
        this.userService.updateUser(user);

        return ResponseEntity.ok(new Response());
    }
}
