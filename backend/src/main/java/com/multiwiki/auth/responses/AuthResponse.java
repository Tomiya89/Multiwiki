package com.multiwiki.auth.responses;

import com.multiwiki.common.responses.Response;
import com.multiwiki.user.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse extends Response {
    String token;
    String type = "Bearer";
    private int id;
    private String username;
    private String email;
    private String role;

    public AuthResponse(String token, User user) {
        super();
        this.token = token;
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
    }
}
