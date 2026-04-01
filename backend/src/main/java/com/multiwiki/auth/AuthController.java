package com.multiwiki.auth;

import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.auth.requests.AuthRequest;
import com.multiwiki.auth.requests.ChangeEmailRequest;
import com.multiwiki.auth.requests.ChangePasswordRequest;
import com.multiwiki.auth.requests.ConfirmEmailRequest;
import com.multiwiki.auth.requests.ConfirmRegisterRequest;
import com.multiwiki.auth.requests.CreateTokenRequest;
import com.multiwiki.auth.requests.RegisterRequest;
import com.multiwiki.auth.responses.AuthErrorResponse;
import com.multiwiki.auth.responses.AuthResponse;
import com.multiwiki.auth.services.EmailChangeService;
import com.multiwiki.auth.services.JwtService;
import com.multiwiki.auth.services.PasswordService;
import com.multiwiki.auth.services.RefreshTokenService;
import com.multiwiki.auth.services.RegistrationService;
import com.multiwiki.common.responses.Response;
import com.multiwiki.user.User;
import com.multiwiki.user.UserService;
import com.multiwiki.user.dto.UserMeDTO;

import jakarta.security.auth.message.AuthException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth/")
public class AuthController {
    private final RefreshTokenService refreshTokenService;
    private final UserService userService;
    private final PasswordService passwordService;
    private final JwtService jwtService;
    private final EmailChangeService emailChangeService;
    private final RegistrationService registrationService;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request, HttpServletRequest httpRequest, HttpServletResponse response){
        try {
            User user = this.userService.getByEmail(request.getEmail()).orElseThrow(() -> new Exception("User not found"));

            if(!this.passwordService.checkPassword(request.getPassword(), user.getPassword()))
                throw new Exception("Password is wrong");

            String refreshToken = this.refreshTokenService.create(new CreateTokenRequest(user, httpRequest));
            String accessToken = jwtService.generateAccessToken(user);

            this.setRefreshTokenCookie(refreshToken, response);

            return ResponseEntity.ok(new AuthResponse(accessToken, user));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthErrorResponse(EnumAuthErrorResponse.AUTH_ERROR));
        }
    }

    @PostMapping("/register/initiate")
    public ResponseEntity<?> initiateRegister(@Valid @RequestBody RegisterRequest request) {
        Optional<User> existingUser = this.userService.getByEmail(request.getEmail());
        
        if (existingUser.isPresent()) {
            if (existingUser.get().isEnabled())
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthErrorResponse(EnumAuthErrorResponse.EMAIL_ALREADY_EXISTS));
        }

        if (this.userService.existsByUsername(request.getUsername()) && 
            this.userService.getByUsername(request.getUsername()).map(User::isEnabled).orElse(false)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new AuthErrorResponse(EnumAuthErrorResponse.USERNAME_TAKEN));
        }

        try {
            this.registrationService.initiateRegistration(request);
            return ResponseEntity.ok(new Response());
        } catch (Exception e) {
            System.err.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/register/confirm")
    public ResponseEntity<?> confirmRegister(@RequestBody ConfirmRegisterRequest request, 
                                            HttpServletRequest httpRequest, 
                                            HttpServletResponse response) {
        try {
            User user = this.registrationService.confirmRegistration(request.getEmail(), request.getCode());
            
            String refreshToken = this.refreshTokenService.create(new CreateTokenRequest(user, httpRequest));
            String accessToken = jwtService.generateAccessToken(user);
            this.setRefreshTokenCookie(refreshToken, response);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthResponse(accessToken, user));
                    
        } catch (AuthException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthErrorResponse(EnumAuthErrorResponse.CODE_INVALID));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response){
        String refreshTokenString = this.extractRefreshToken(request);

        if (refreshTokenString != null) {
            try {
                RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenString, request);
                refreshTokenService.revokeToken(refreshToken.getId());
            } catch (RuntimeException e) { }
        }

        this.clearRefreshTokenCookie(response);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout-all")
    public ResponseEntity<?> logoutAll(HttpServletRequest request, HttpServletResponse response) {
        String refreshTokenString = this.extractRefreshToken(request);

        if (refreshTokenString != null) {
            try {
                RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(refreshTokenString, request);
                refreshTokenService.revokeAllUserTokens(refreshToken.getUser());
            } catch (RuntimeException e) { }
        }

        this.clearRefreshTokenCookie(response);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response){
        String refreshTokenString = this.extractRefreshToken(request);

        if (refreshTokenString == null) 
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthErrorResponse(EnumAuthErrorResponse.REFRESH_TOKEN_MISSING));

        try {
            RefreshToken oldToken = refreshTokenService.verifyRefreshToken(refreshTokenString, request);
            User user = oldToken.getUser();

            String newRefreshToken = this.refreshTokenService.rotateRefreshToken(oldToken, request);

            String newAccessToken = jwtService.generateAccessToken(user);

            this.setRefreshTokenCookie(newRefreshToken, response);

            return ResponseEntity.ok(new AuthResponse(newAccessToken, user));
        } catch (Exception e) {
            this.clearRefreshTokenCookie(response);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.REFRESH_INVALID));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserMeDTO> me(@AuthenticationPrincipal User requester) {
        return ResponseEntity.ok().body(new UserMeDTO(requester));
    }
    
    @PostMapping("/change-email")
    public ResponseEntity<?> changeEmail(@AuthenticationPrincipal User requester, @Valid @RequestBody ChangeEmailRequest request) {
        try {
            this.emailChangeService.initiateEmailChange(requester, request);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return ResponseEntity.ok(new Response());
    }
    
    @PostMapping("/confirm-change-email")
    public ResponseEntity<?> confirmChangeEmail(@AuthenticationPrincipal User requester, @Valid @RequestBody ConfirmEmailRequest request) {
        return this.emailChangeService.confirmChangeEmail(requester, request.getCode());
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal User requester, @Valid @RequestBody ChangePasswordRequest request) {
        if(!this.passwordService.checkPassword(request.getOldPassword(), requester.getPassword()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new AuthErrorResponse(EnumAuthErrorResponse.AUTH_ERROR));

        requester.setPassword(this.passwordService.hashPasword(request.getNewPassword()));
        this.userService.updateUser(requester);

        return ResponseEntity.ok().body(new Response());
    }

    private void setRefreshTokenCookie(String token, HttpServletResponse response){
        Cookie cookie = new Cookie("refreshToken", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/auth/");
        cookie.setAttribute("SameSite", "Lax");
        cookie.setMaxAge((int)(this.refreshExpiration / 1000L));
        response.addCookie(cookie);
    }

    private void clearRefreshTokenCookie(HttpServletResponse response){
        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/api/auth/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    private String extractRefreshToken(HttpServletRequest request){
        Cookie[] cookies = request.getCookies();
        System.out.println("Cookies: " + Arrays.toString(cookies));
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName()))
                    return cookie.getValue();
            }
        }
        return null;
    }
}
