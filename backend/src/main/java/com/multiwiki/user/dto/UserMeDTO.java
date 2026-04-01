package com.multiwiki.user.dto;

import java.time.LocalDateTime;

import com.multiwiki.user.User;

import lombok.Data;

@Data
public class UserMeDTO {
    private int id;
    private String username;
    private String email;
    private int avatarId;
    private String role;
    private LocalDateTime createdAt;

    public UserMeDTO(User user){
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.avatarId = user.getAvatarId();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
    }
}
