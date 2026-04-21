package com.multiwiki.article.responses;

import com.multiwiki.article.EnumArticleResponse;
import com.multiwiki.common.responses.ErrorResponse;

public class ArticleErrorResponse extends ErrorResponse<EnumArticleResponse> {

    public ArticleErrorResponse(EnumArticleResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
}
