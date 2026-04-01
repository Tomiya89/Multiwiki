package com.multiwiki.auth.requests;

import com.multiwiki.user.User;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTokenRequest {
    private User user;
    private HttpServletRequest request;
}
