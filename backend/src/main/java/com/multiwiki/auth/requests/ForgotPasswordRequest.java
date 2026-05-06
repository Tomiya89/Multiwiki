package com.multiwiki.auth.requests;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}