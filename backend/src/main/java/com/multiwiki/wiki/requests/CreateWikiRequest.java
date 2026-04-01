package com.multiwiki.wiki.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateWikiRequest {
    @NotBlank(message = "Name wiki is required")
    private String name;
}
