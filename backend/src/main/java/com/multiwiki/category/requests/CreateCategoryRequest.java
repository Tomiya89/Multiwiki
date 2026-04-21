package com.multiwiki.category.requests;

import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateCategoryRequest {
    private User requester;

    private Wiki wiki;

    @NotBlank(message = "Name is required")
    private String name;

    public CreateCategoryRequest(String name) {
        this.name = name;
    }
}
