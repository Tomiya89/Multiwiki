package com.multiwiki.translation.responses;

import com.multiwiki.common.responses.ErrorResponse;
import com.multiwiki.translation.EnumTranslationResponse;

public class TranslationErrorResponse extends ErrorResponse<EnumTranslationResponse> {
     public TranslationErrorResponse(EnumTranslationResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
}
