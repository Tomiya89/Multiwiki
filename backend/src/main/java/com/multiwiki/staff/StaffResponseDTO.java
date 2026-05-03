package com.multiwiki.staff;

import com.multiwiki.user.dto.UserDTO;
import com.multiwiki.wiki.Wiki;

import lombok.Data;

@Data
public class StaffResponseDTO {
    private int id;
    private String role;
    private UserDTO user;
    private Wiki wiki;

    public StaffResponseDTO(Staff staff){
        this.id = staff.getId();
        this.role = staff.getRole();
        this.user = new UserDTO(staff.getUser());
        this.wiki = staff.getWiki();
    }
}