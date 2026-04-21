package com.multiwiki.article.requests;

import com.multiwiki.category.Category;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateArticleRequest {
    private User requester;

    private Wiki wiki;

    private Category category;

    @NotBlank(message = "Name is required")
    private String name;
}
