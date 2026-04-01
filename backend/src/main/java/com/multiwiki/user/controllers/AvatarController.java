package com.multiwiki.user.controllers;

import java.io.IOException;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.multiwiki.Image.Image;
import com.multiwiki.Image.ImageService;
import com.multiwiki.common.responses.Response;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.user.UserService;

@RestController
@RequestMapping("/api/users/")
public class AvatarController {
    @Autowired
    private UserService userService;

    @Autowired
    private ImageService imageService;

    //#region Get avatar
    
    @GetMapping("/{id}/avatar")
    public ResponseEntity<?> getAvatarById(@PathVariable int id) {
        Optional<User> opt_user = this.userService.getById(id);
        if(opt_user.isEmpty())
            return ResponseEntity.notFound().build(); 
        User user = opt_user.get();
        Optional<Image> image = this.imageService.findById(user.getAvatarId());
        if(image.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.status(HttpStatus.OK).body(image.get());
    }
    
    @GetMapping("/username/{username}/avatar")
    public ResponseEntity<?> getAvatarByUsername(@PathVariable String username) {
        Optional<User> opt_user = this.userService.getByUsername(username);
        if(opt_user.isEmpty())
            return ResponseEntity.notFound().build(); 
        User user = opt_user.get();
        Optional<Image> image = this.imageService.findById(user.getAvatarId());
        if(image.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.status(HttpStatus.OK).body(image.get());
    }

    //#endregion

    //#region upload avatar

    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> setAvatarById(@AuthenticationPrincipal User requester, @PathVariable int id, @RequestParam("file") MultipartFile file) {
        Optional<User> opt_user = this.userService.getById(id);
        if(opt_user.isEmpty())
            return ResponseEntity.notFound().build(); 

        User user = opt_user.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != user.getId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        try{
            Image image = this.imageService.createAvatar(requester, file);
            
            this.imageService.deleteImage(user.getAvatarId());

            user.setAvatarId(image.getId());

            this.userService.updateUser(user);

            return ResponseEntity.status(HttpStatus.OK).body(image);
        }
        catch(IOException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        }
    }

    @PostMapping("/username/{username}/avatar")
    public ResponseEntity<?> setAvatarByUsername(@AuthenticationPrincipal User requester, @PathVariable String username, @RequestParam("file") MultipartFile file) {
        Optional<User> opt_user = this.userService.getByUsername(username);
        if(opt_user.isEmpty())
            return ResponseEntity.notFound().build(); 
        User user = opt_user.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != user.getId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        try{
            Image image = this.imageService.createAvatar(requester, file);

            this.imageService.deleteImage(user.getAvatarId());
            
            user.setAvatarId(image.getId());

            this.userService.updateUser(user);

            return ResponseEntity.status(HttpStatus.OK).body(image);
        }
        catch(IOException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        }
    }

    //#endregion

    //#region delete avatar

    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<?> deleteAvatarById(@AuthenticationPrincipal User requester, @PathVariable int id){
        Optional<User> opt_user = this.userService.getById(id);
        if(opt_user.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not found");

        User user = opt_user.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != user.getId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        this.imageService.deleteImage(user.getAvatarId());

        user.setAvatarId(0);
        this.userService.updateUser(user);
        
        return ResponseEntity.ok(new Response());
    }

    @DeleteMapping("/username/{username}/avatar")
    public ResponseEntity<?> deleteAvatarByUsername(@AuthenticationPrincipal User requester, @PathVariable String username){
        Optional<User> opt_user = this.userService.getByUsername(username);
        if(opt_user.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("User is not found");

        User user = opt_user.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != user.getId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        this.imageService.deleteImage(user.getAvatarId());

        user.setAvatarId(0);
        this.userService.updateUser(user);

        return ResponseEntity.ok(new Response());
    }

    //#endregion
}
