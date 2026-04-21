package com.multiwiki.translation.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class CreateTranslationRequest {
    private EnumTranslatableType type;

    @JsonProperty
    private int id = -1;

    private User requester;

    private Wiki wiki;

    @NotBlank(message = "Locale is required")
    private String locale;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Body is required")
    private String body;

    public CreateTranslationRequest(String title, String body, String locale) {
        this.title = title;
        this.body = body;
        this.locale = locale;
    }
}