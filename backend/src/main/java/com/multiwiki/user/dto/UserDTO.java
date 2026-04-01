package com.multiwiki.user.dto;

import java.time.LocalDateTime;

import com.multiwiki.user.User;

import lombok.Data;

@Data
public class UserDTO {
    private int id;
    private String username;
    private int avatarId;
    private String role;
    private LocalDateTime createdAt;

    public UserDTO(User user){
        this.id = user.getId();
        this.username = user.getUsername();
        this.avatarId = user.getAvatarId();
        this.role = user.getRole();
        this.createdAt = user.getCreatedAt();
    }
}
