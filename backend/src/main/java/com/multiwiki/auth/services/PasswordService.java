package com.multiwiki.auth.services;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String hashPasword(String password){
        return this.passwordEncoder.encode(password);
    }
    public boolean checkPassword(String password, String hash){
        return this.passwordEncoder.matches(password, hash);
    }
}
