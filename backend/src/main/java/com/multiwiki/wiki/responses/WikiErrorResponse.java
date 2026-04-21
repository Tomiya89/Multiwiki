package com.multiwiki.wiki.responses;

import com.multiwiki.common.responses.ErrorResponse;
import com.multiwiki.wiki.EnumWikiResponse;

public class WikiErrorResponse extends ErrorResponse<EnumWikiResponse> {

    public WikiErrorResponse(EnumWikiResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
}
