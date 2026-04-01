package com.multiwiki.staff.requests;

import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateStaffRequest {
    private User requester;
    
    private User user;

    private String username;

    private int userId;

    private Wiki wiki;

    @NotBlank(message = "Role is required")
    private String role;

    public CreateStaffRequest(String role, int userId){
        this.role = role;
        this.userId = userId;
    }
    public CreateStaffRequest(String role, String username){
        this.role = role;
        this.username = username;
    }
}
