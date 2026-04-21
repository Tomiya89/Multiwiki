package com.multiwiki.category.requests;

import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeleteCategoryRequest {
    private User requester;

    private Wiki wiki;

    
    private String name;

    public DeleteCategoryRequest(String name){
        this.name = name;
    }
}
