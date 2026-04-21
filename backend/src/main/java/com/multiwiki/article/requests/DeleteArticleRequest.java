package com.multiwiki.article.requests;

import com.multiwiki.category.Category;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeleteArticleRequest {
    private User requester;

    private Wiki wiki;

    private Category category;

    private String name;
}
