package com.multiwiki.message.attributes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleMessageAttributes {
    private String wikiName;

    private String categoryName;

    private String articleName;
}
