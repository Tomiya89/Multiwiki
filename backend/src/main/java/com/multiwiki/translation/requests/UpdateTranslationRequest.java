package com.multiwiki.translation.requests;

import com.multiwiki.translation.EnumTranslatableType;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTranslationRequest {
    private EnumTranslatableType type;

    private int id;

    private User requester;

    private Wiki wiki;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Body is required")
    private String body;

    public UpdateTranslationRequest(String title, String body) {
        this.title = title;
        this.body = body;
    }
}