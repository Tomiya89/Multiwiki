package com.multiwiki.message.attributes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostMessageAttributes {
    private String wikiName;
    
    private int postId;
}
