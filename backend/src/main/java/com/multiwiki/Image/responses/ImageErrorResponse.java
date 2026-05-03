package com.multiwiki.Image.responses;

import com.multiwiki.Image.EnumImageResponse;
import com.multiwiki.common.responses.ErrorResponse;

public class ImageErrorResponse extends ErrorResponse<EnumImageResponse> {

    public ImageErrorResponse(EnumImageResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
}
