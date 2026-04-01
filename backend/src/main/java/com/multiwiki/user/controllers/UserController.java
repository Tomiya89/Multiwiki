package com.multiwiki.user.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.user.User;
import com.multiwiki.user.UserService;
import com.multiwiki.user.dto.UserDTO;

 
@RestController
@RequestMapping("/api/users/")
public class UserController {
    @Autowired
    private UserService userService;
    
    //#region Get User

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id){
        Optional<User> user = this.userService.getById(id);
        Optional<UserDTO> dto = this.convertToDTO(user);
        if(!dto.isEmpty())
            return ResponseEntity.status(HttpStatus.OK).body(this.convertToDTO(user));
        return ResponseEntity.notFound().build();   
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        Optional<User> user = this.userService.getByUsername(username);
        if(!user.isEmpty())
            return ResponseEntity.status(HttpStatus.OK).body(this.convertToDTO(user));
        return ResponseEntity.notFound().build();
    }

    //#endregion

    private Optional<UserDTO> convertToDTO(Optional<User> user){
        if(!user.isEmpty())
            return Optional.of(new UserDTO(user.get()));

        return Optional.empty();
    }
}
