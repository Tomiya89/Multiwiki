package com.multiwiki.post.responses;

import com.multiwiki.common.responses.ErrorResponse;
import com.multiwiki.post.EnumPostResponse;

public class PostErrorResponse extends ErrorResponse<EnumPostResponse> {

    public PostErrorResponse(EnumPostResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
}
