package com.multiwiki.auth.services;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import com.multiwiki.auth.RefreshToken;
import com.multiwiki.auth.RefreshTokenRepository;
import com.multiwiki.auth.requests.CreateTokenRequest;
import com.multiwiki.user.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

@Service
public class RefreshTokenService{
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private JwtService jwtService;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;
    
    public void delete(RefreshToken request) {
        this.refreshTokenRepository.delete(request);
    }
    
    public void deleteByUser(User user){
        this.refreshTokenRepository.deleteByUser(user);
    }

    public String create(CreateTokenRequest request) {
        String deviceFingerprint = this.generateDeviceFingerprint(request.getRequest());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(request.getUser());
        refreshToken.setExpiresAt(LocalDateTime.now().plusSeconds(this.refreshExpiration / 1000));
        refreshToken.setLastIpAddress(this.getClientIp(request.getRequest()));
        refreshToken.setUserAgent(request.getRequest().getHeader("User-Agent"));
        refreshToken.setDeviceFingerprint(deviceFingerprint);

        RefreshToken savedToken = refreshTokenRepository.save(refreshToken);

        Map<String, Object> claims = new HashMap<>();
        claims.put("tokenId", savedToken.getId());
        claims.put("fingerprint", deviceFingerprint);
        claims.put("type", "refresh");

        String token = this.jwtService.generateRefreshToken(claims, request.getUser().getUsername(), this.refreshExpiration);

        return token;
    }

    public RefreshToken verifyRefreshToken(String token, HttpServletRequest request){
        Integer tokenId = this.jwtService.extractTokenId(token);
        String fingerprint = this.jwtService.extractFingerprint(token);

        RefreshToken refreshToken = this.refreshTokenRepository.findByIdAndRevokedFalse(tokenId).orElseThrow(() -> new RuntimeException("Refresh token not found or revoked"));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            this.refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token expired");
        }

        String currentFingerprint = generateDeviceFingerprint(request);
        if (!fingerprint.equals(currentFingerprint)) {
            // this.revokeAllUserTokens(refreshToken.getUser());
            // throw new SecurityException("Security violation detected");
        }

        String currentIp = this.getClientIp(request);
        refreshToken.setLastUsedAt(LocalDateTime.now());
        refreshToken.setLastIpAddress(currentIp);
        this.refreshTokenRepository.save(refreshToken);

        return refreshToken;
    }

    @Transactional
    public String rotateRefreshToken(RefreshToken oldRefreshToken, HttpServletRequest request) throws Exception, AccessDeniedException{
        User user = oldRefreshToken.getUser();

        String newRefreshToken = this.create(new CreateTokenRequest(user, request));

        oldRefreshToken.setRevoked(true);
        this.refreshTokenRepository.save(oldRefreshToken);

        return newRefreshToken;
    }

    @Transactional
    public void revokeAllUserTokens(User user){
        this.refreshTokenRepository.revokeAllUserTokens(user);
    }

    @Transactional
    public void revokeToken(int id){
        Optional<RefreshToken> opt_refreshToken = this.refreshTokenRepository.findByIdAndRevokedFalse(id);
        if(opt_refreshToken.isPresent()){
            RefreshToken refreshToken = opt_refreshToken.get();
            refreshToken.setRevoked(true);
            this.refreshTokenRepository.save(refreshToken);
        }
    }

    @Transactional
    public void cleanupExpiredTokens(){
        LocalDateTime now = LocalDateTime.now();
        this.refreshTokenRepository.deleteAllExpiredTokens(now);

        LocalDateTime cutoffDate = now.minusDays(30);
        this.refreshTokenRepository.deleteRevokedTokensOlderThan(cutoffDate);
    }

    private String generateDeviceFingerprint(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        String acceptLanguage = request.getHeader("Accept-Language");
        String acceptEncoding = request.getHeader("Accept-Encoding");
        
        String fingerprint = (userAgent != null ? userAgent : "") + "|" +
                            (acceptLanguage != null ? acceptLanguage : "") + "|" +
                            (acceptEncoding != null ? acceptEncoding : "");
        
        return DigestUtils.md5DigestAsHex(fingerprint.getBytes());
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) 
            return xForwardedFor.split(",")[0].trim();

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty())
            return xRealIp;
        
        return request.getRemoteAddr();
    }
}
