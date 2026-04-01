package com.multiwiki.Image;

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

import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;

@RestController
@RequestMapping("/api/images")
public class ImageController {
    @Autowired
    private ImageService imageService;

    @GetMapping("/{id}")
    public ResponseEntity<Image> getById(@PathVariable int id) {
        Optional<Image> image = this.imageService.findById(id);

        if(!image.isEmpty())
            return ResponseEntity.status(HttpStatus.OK).body(image.get());
        return ResponseEntity.notFound().build();   
    }
    
    @GetMapping("/url/{url}")
    public ResponseEntity<Image> getByUrl(@PathVariable String url) {
        Optional<Image> image = this.imageService.findByUrl(url);

        if(!image.isEmpty())
            return ResponseEntity.status(HttpStatus.OK).body(image.get());
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/filename/{filename}")
    public ResponseEntity<Image> getByFilename(@PathVariable String filename) {
        Optional<Image> image = this.imageService.findByFilename(filename);

        if(!image.isEmpty())
            return ResponseEntity.status(HttpStatus.OK).body(image.get());
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(@AuthenticationPrincipal User user, @RequestParam("file") MultipartFile file) {
        try{
            Image image = this.imageService.createImage(user, file);

            return ResponseEntity.status(HttpStatus.OK).body(image);
        }
        catch(IOException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImageById(@AuthenticationPrincipal User requester, @PathVariable int id){
        Optional<Image> opt_image = this.imageService.findById(id);

        if(opt_image.isEmpty())
            return ResponseEntity.notFound().build(); 

        Image image = opt_image.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != image.getUserId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("У вас не достаточно прав");

        this.imageService.deleteImage(id);

        return ResponseEntity.status(HttpStatus.OK).build();
    }

    @DeleteMapping("/url/{url}")
    public ResponseEntity<?> deleteImageByUrl(@AuthenticationPrincipal User requester, @PathVariable String url) {
        Optional<Image> opt_image = this.imageService.findByUrl(url);

        if(opt_image.isEmpty())
            return ResponseEntity.notFound().build(); 

        Image image = opt_image.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != image.getUserId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("У вас не достаточно прав");

        this.imageService.deleteImage(image.getId());

        return ResponseEntity.status(HttpStatus.OK).build();
    }
    
    @DeleteMapping("/filename/{filename}")
    public ResponseEntity<?> deleteImageByFilename(@AuthenticationPrincipal User requester, @PathVariable String filename) {
        Optional<Image> opt_image = this.imageService.findByFilename(filename);

        if(opt_image.isEmpty())
            return ResponseEntity.notFound().build(); 

        Image image = opt_image.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != image.getUserId())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("У вас не достаточно прав");

        this.imageService.deleteImage(image.getId());

        return ResponseEntity.status(HttpStatus.OK).build();
    }
}
