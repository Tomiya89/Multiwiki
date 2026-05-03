package com.multiwiki.post;

import java.time.LocalDateTime;

import com.multiwiki.user.dto.UserDTO;

import lombok.Data;

@Data
public class PostDTO {
    private int id;
    private String title;
    private String body;
    private UserDTO user;
    private int likesCount;
    private LocalDateTime createdAt;

    public PostDTO(Post post){
        this.id = post.getId();
        this.title = post.getTitle();
        this.body = post.getBody();
        this.user = new UserDTO(post.getUser());
        this.likesCount = post.getLikesCount();
        this.createdAt = post.getCreatedAt();
    }
}
