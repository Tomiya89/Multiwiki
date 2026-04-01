package com.multiwiki.auth.responses;

import com.multiwiki.auth.EnumAuthErrorResponse;
import com.multiwiki.common.responses.ErrorResponse;

public class AuthErrorResponse extends ErrorResponse<EnumAuthErrorResponse> {
    public AuthErrorResponse(EnumAuthErrorResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
    
}
