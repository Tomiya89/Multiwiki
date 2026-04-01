package com.multiwiki.auth.services;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.multiwiki.auth.EnumAuthErrorResponse;
import com.multiwiki.auth.requests.ChangeEmailRequest;
import com.multiwiki.auth.responses.AuthErrorResponse;
import com.multiwiki.common.responses.Response;
import com.multiwiki.common.services.EmailService;
import com.multiwiki.user.User;
import com.multiwiki.user.UserService;

import jakarta.mail.MessagingException;

@Service
public class EmailChangeService {
    @Autowired
    private UserService userService;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private EmailService emailService;

    @Value("${change.mail.expiry-minutes}")
    private int expiryMinutes;

    public ResponseEntity<?> initiateEmailChange(User user, ChangeEmailRequest request) throws MessagingException{
        if (!this.passwordService.checkPassword(request.getPassword(), user.getPassword())) 
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.PASSWORD_INVALID));
        
        String newEmail = request.getEmail();

        if (this.userService.existsByEmail(newEmail)) 
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.EMAIL_ALREADY_EXISTS));
        if (user.getEmail().equalsIgnoreCase(newEmail)) 
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.EMAIL_IS_EQUAL_CURRENT));

        String code = String.format("%06d", new Random().nextInt(999999));

        user.setPendingNewEmail(newEmail);
        user.setEmailChangeCodeHash(this.passwordService.hashPasword(code));
        user.setEmailChangeCodeExpiry(LocalDateTime.now().plusMinutes(expiryMinutes));
        this.userService.updateUser(user);
        try {
            this.emailService.sendEmailChangeCode(newEmail, code);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.FAILED_TO_SEND_MAIL));
        }
        
        return ResponseEntity.ok().body(new Response());
    }

    public ResponseEntity<?> confirmChangeEmail(User user, String code){
        String codeHash = user.getEmailChangeCodeHash();
        if(codeHash == null  || !this.passwordService.checkPassword(code, codeHash))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.CODE_INVALID));

        if (user.getEmailChangeCodeExpiry().isBefore(LocalDateTime.now()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.CODE_INVALID));

        user.setEmail(user.getPendingNewEmail());
        user.setPendingNewEmail(null);
        user.setEmailChangeCodeExpiry(null);
        user.setEmailChangeCodeHash(null);
        
        this.userService.updateUser(user);

        return ResponseEntity.ok().body(new Response());
    }
}
