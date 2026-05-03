package com.multiwiki.message.attributes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryMessageAttributes {
    private String wikiName;

    private String categoryName;
}
