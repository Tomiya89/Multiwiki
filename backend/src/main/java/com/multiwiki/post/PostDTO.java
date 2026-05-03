package com.multiwiki.post;

import java.time.LocalDateTime;

import com.multiwiki.user.dto.UserDTO;
import com.multiwiki.wiki.Wiki;

import lombok.Data;

@Data
public class PostDTO {
    private int id;
    private String title;
    private String body;
    private Wiki wiki;
    private UserDTO user;
    private int likesCount;
    private LocalDateTime createdAt;
    private boolean isLiked;

    public PostDTO(Post post){
        this.id = post.getId();
        this.title = post.getTitle();
        this.body = post.getBody();
        this.wiki = post.getWiki();
        this.user = new UserDTO(post.getUser());
        this.likesCount = post.getLikesCount();
        this.createdAt = post.getCreatedAt();
        this.isLiked = post.getIsLiked();
    }
}
