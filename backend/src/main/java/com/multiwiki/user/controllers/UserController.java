package com.multiwiki.user.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.post.Post;
import com.multiwiki.post.PostDTO;
import com.multiwiki.post.PostService;
import com.multiwiki.staff.Staff;
import com.multiwiki.staff.StaffResponseDTO;
import com.multiwiki.staff.StaffService;
import com.multiwiki.translation.EnumTranslatableType;
import com.multiwiki.translation.Translation;
import com.multiwiki.translation.TranslationDTO;
import com.multiwiki.translation.TranslationService;
import com.multiwiki.user.User;
import com.multiwiki.user.UserService;
import com.multiwiki.user.dto.UserDTO;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;
 
@RestController
@RequestMapping("/api/users/")
public class UserController {
    @Autowired
    private UserService userService;
    
    @Autowired
    private StaffService staffService;

    @Autowired
    private PostService postService;

    @Autowired
    private WikiService wikiService;

    @Autowired
    private TranslationService translationService;
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

    @GetMapping("/{id}/staffs")
    public ResponseEntity<?> getStaffsById(
        @AuthenticationPrincipal User requester, 
        @PathVariable int id,
        @RequestParam(defaultValue = "en") String locale,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Optional<User> user = this.userService.getById(id);
        if(user.isEmpty())
            return ResponseEntity.notFound().build();   

        if((user.get().getId() != requester.getId()) && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Staff> staffPage = staffService.findByUser(user.get(), pageable);

        Page<StaffResponseDTO> response = staffPage.map(StaffResponseDTO::new);

        for (StaffResponseDTO staff : response) {
            Optional<Translation> translOpt = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(
                EnumTranslatableType.WIKI, 
                staff.getWiki().getId(), 
                locale
            );

            if (translOpt.isPresent()) {
                Translation transl = translOpt.get();
                TranslationDTO dto = new TranslationDTO(transl); 
                staff.getWiki().setTranslations(List.of(dto));
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/posts")
    public ResponseEntity<?> getPostsById(
        @AuthenticationPrincipal User requester, 
        @PathVariable int id,
        @RequestParam(defaultValue = "en") String locale,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Optional<User> user = this.userService.getById(id);
        if(user.isEmpty())
            return ResponseEntity.notFound().build();   

        if((user.get().getId() != requester.getId()) && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Post> postPage = postService.findAllByUser(user.get(), pageable);

        for (Post post : postPage) {
            Optional<Translation> translOpt = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(
                EnumTranslatableType.WIKI, 
                post.getWiki().getId(), 
                locale
            );

            if (translOpt.isPresent()) {
                Translation transl = translOpt.get();
                TranslationDTO dto = new TranslationDTO(transl); 
                post.getWiki().setTranslations(List.of(dto));
            }
        }

        Page<PostDTO> response = postPage.map(PostDTO::new);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/wikis")
    public ResponseEntity<?> getWikisById(
        @AuthenticationPrincipal User requester, 
        @PathVariable int id,
        @RequestParam(defaultValue = "en") String locale,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Optional<User> user = this.userService.getById(id);
        if(user.isEmpty())
            return ResponseEntity.notFound().build();   

        if((user.get().getId() != requester.getId()) && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Wiki> wikiPage = wikiService.findByUserId(user.get().getId(), pageable);

        for (Wiki wiki : wikiPage) {
            Optional<Translation> translOpt = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(
                EnumTranslatableType.WIKI, 
                wiki.getId(), 
                locale
            );

            if (translOpt.isPresent()) {
                Translation transl = translOpt.get();
                TranslationDTO dto = new TranslationDTO(transl); 
                wiki.setTranslations(List.of(dto));
            }
        }

        return ResponseEntity.ok(wikiPage);
    }

    @GetMapping("/username/{username}/wikis")
    public ResponseEntity<?> getWikisByUsername(
        @AuthenticationPrincipal User requester, 
        @PathVariable String username,
        @RequestParam(defaultValue = "en") String locale,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Optional<User> user = this.userService.getByUsername(username);
        if(user.isEmpty())
            return ResponseEntity.notFound().build();   

        if((user.get().getId() != requester.getId()) && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Wiki> wikiPage = wikiService.findByUserId(user.get().getId(), pageable);

        for (Wiki wiki : wikiPage) {
            Optional<Translation> translOpt = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(
                EnumTranslatableType.WIKI, 
                wiki.getId(), 
                locale
            );

            if (translOpt.isPresent()) {
                Translation transl = translOpt.get();
                TranslationDTO dto = new TranslationDTO(transl); 
                wiki.setTranslations(List.of(dto));
            }
        }

        return ResponseEntity.ok(wikiPage);
    }

    @GetMapping("/username/{username}/posts")
    public ResponseEntity<?> getPostsByUsername(
        @AuthenticationPrincipal User requester, 
        @PathVariable String username,
        @RequestParam(defaultValue = "en") String locale,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Optional<User> user = this.userService.getByUsername(username);
        if(user.isEmpty())
            return ResponseEntity.notFound().build();   

        if((user.get().getId() != requester.getId()) && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Post> postPage = postService.findAllByUser(user.get(), pageable);

        for (Post post : postPage) {
            Optional<Translation> translOpt = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(
                EnumTranslatableType.WIKI, 
                post.getWiki().getId(), 
                locale
            );

            if (translOpt.isPresent()) {
                Translation transl = translOpt.get();
                TranslationDTO dto = new TranslationDTO(transl); 
                post.getWiki().setTranslations(List.of(dto));
            }
        }

        Page<PostDTO> response = postPage.map(PostDTO::new);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/username/{username}/staffs")
    public ResponseEntity<?> getStaffsByUserName(
        @AuthenticationPrincipal User requester, 
        @PathVariable String username,
        @RequestParam(defaultValue = "en") String locale,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Optional<User> user = this.userService.getByUsername(username);
        if(user.isEmpty())
            return ResponseEntity.notFound().build();   

        if((user.get().getId() != requester.getId()) && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        Page<Staff> staffPage = staffService.findByUser(user.get(), pageable);

        Page<StaffResponseDTO> response = staffPage.map(StaffResponseDTO::new);

        for (StaffResponseDTO staff : response) {
            Optional<Translation> translOpt = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(
                EnumTranslatableType.WIKI, 
                staff.getWiki().getId(), 
                locale
            );

            if (translOpt.isPresent()) {
                Translation transl = translOpt.get();
                TranslationDTO dto = new TranslationDTO(transl); 
                staff.getWiki().setTranslations(List.of(dto));
            }
        }

        return ResponseEntity.ok(response);
    }

    private Optional<UserDTO> convertToDTO(Optional<User> user){
        if(!user.isEmpty())
            return Optional.of(new UserDTO(user.get()));

        return Optional.empty();
    }
}
