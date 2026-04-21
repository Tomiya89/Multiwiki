package com.multiwiki.category.responses;

import com.multiwiki.category.EnumCategoryResponse;
import com.multiwiki.common.responses.ErrorResponse;

public class CategoryErrorResponse extends ErrorResponse<EnumCategoryResponse> {

    public CategoryErrorResponse(EnumCategoryResponse error) {
        super(error);
    }

    @Override
    public String getError() {
        return this.error.name();
    }
}
