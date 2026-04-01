package com.multiwiki.wiki;

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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.multiwiki.Image.Image;
import com.multiwiki.Image.ImageService;
import com.multiwiki.staff.StaffService;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.requests.CreateWikiRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wikis")
public class WikiController {
    @Autowired
    private WikiService wikiService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private StaffService staffService;

    @GetMapping("/{name}")
    public ResponseEntity<Wiki> getByID(@PathVariable String name) {
        Optional<Wiki> wiki = this.wikiService.findByName(name);
        if(wiki.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(wiki.get());
    }

    @PostMapping
    public ResponseEntity<Wiki> createWiki(@AuthenticationPrincipal User requester, @Valid @RequestBody CreateWikiRequest request) {
        return ResponseEntity.ok(this.wikiService.create(request, requester));
    }       

    @GetMapping("/{name}/background")
    public ResponseEntity<Image> getBackgroundImage(@PathVariable String name) {
        Optional<Wiki> wiki = this.wikiService.findByName(name);
        if(wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Optional<Image> image = this.imageService.findById(wiki.get().getBackgroundImageId());
        if(image.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok().body(image.get());
    }
    
    @GetMapping("/{name}/card")
    public ResponseEntity<Image> getCardImage(@PathVariable String name) {
        Optional<Wiki> wiki = this.wikiService.findByName(name);
        if(wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Optional<Image> image = this.imageService.findById(wiki.get().getCardImageId());
        if(image.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok().body(image.get());
    }

    @DeleteMapping("/{name}/background")
    public ResponseEntity<?> deleteBackgroundImage(@AuthenticationPrincipal User requester, @PathVariable String name) {
        Optional<Wiki> wiki = this.wikiService.findByName(name);
        if(wiki.isEmpty())
            return ResponseEntity.notFound().build();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.get().getUserId() && !this.staffService.isOwner(wiki.get().getId(), requester.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        Optional<Image> image = this.imageService.findById(wiki.get().getBackgroundImageId());
        if(image.isEmpty())
            return ResponseEntity.notFound().build();

        this.imageService.deleteImage(image.get().getId());

        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{name}/card")
    public ResponseEntity<?> deleteCardImage(@AuthenticationPrincipal User requester, @PathVariable String name) {
        Optional<Wiki> wiki = this.wikiService.findByName(name);
        if(wiki.isEmpty())
            return ResponseEntity.notFound().build();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.get().getUserId() && !this.staffService.isOwner(wiki.get().getId(), requester.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        Optional<Image> image = this.imageService.findById(wiki.get().getCardImageId());
        if(image.isEmpty())
            return ResponseEntity.notFound().build();

        this.imageService.deleteImage(image.get().getId());

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{name}/background")
    public ResponseEntity<?> uploadBackgroundImage(@AuthenticationPrincipal User requester, @RequestParam("file") MultipartFile file, @PathVariable String name) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(name);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isOwner(wiki.getId(), requester.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        Optional<Image> old_image = this.imageService.findById(wiki.getBackgroundImageId());
        if(!old_image.isEmpty())
            this.imageService.deleteImage(old_image.get().getId());
        try {
            Image image = this.imageService.createBackground(requester, file);
            wiki.setBackgroundImageId(image.getId());
            this.wikiService.update(wiki);
            return ResponseEntity.ok().body(image);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{name}/card")
    public ResponseEntity<?> uploadCardImage(@AuthenticationPrincipal User requester, @RequestParam("file") MultipartFile file, @PathVariable String name) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(name);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isOwner(wiki.getId(), requester.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have the required rights");

        Optional<Image> old_image = this.imageService.findById(wiki.getCardImageId());
        if(!old_image.isEmpty())
            this.imageService.deleteImage(old_image.get().getId());
        try {
            Image image = this.imageService.createCard(requester, file);
            wiki.setCardImageId(image.getId());
            this.wikiService.update(wiki);
            return ResponseEntity.ok().body(image);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

//@AuthenticationPrincipal User user, @RequestParam("file") MultipartFile file
