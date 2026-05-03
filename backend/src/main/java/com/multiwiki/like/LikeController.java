package com.multiwiki.like;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.like.requests.CreateLikeRequest;
import com.multiwiki.message.Message;
import com.multiwiki.message.MessageService;
import com.multiwiki.post.Post;
import com.multiwiki.post.PostService;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

@RestController
@RequestMapping("/api")
public class LikeController {
    @Autowired
    private LikeService likeService;

    @Autowired
    private PostService postService;

    @Autowired
    private WikiService wikiService;

    @Autowired
    private MessageService messageService;

    @GetMapping("/wikis/{wikiName}/posts/{postId}/like")
    public ResponseEntity<?> likePost(@AuthenticationPrincipal User requester, @PathVariable String wikiName, @PathVariable int postId) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Wiki is not found");
        
        Optional<Post> opt_post = this.postService.findPostByIdAndWikiID(postId, opt_wiki.get().getId());
        if(opt_post.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Post is not found");

        Post post = opt_post.get();

        CreateLikeRequest request = new CreateLikeRequest(requester, EnumLikeAttachmentType.POST, post.getId());
        
        try {
            this.likeService.create(request);
            post.like();
            this.postService.update(post);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Like is created");
        }
    }

    @DeleteMapping("/wikis/{wikiName}/posts/{postId}/like")
    public ResponseEntity<?> unlikePost(@AuthenticationPrincipal User requester, @PathVariable String wikiName, @PathVariable int postId) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Wiki is not found");
        
        Optional<Post> opt_post = this.postService.findPostByIdAndWikiID(postId, opt_wiki.get().getId());
        if(opt_post.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Post is not found");

        Post post = opt_post.get();

        Optional<Like> like = this.likeService.find(EnumLikeAttachmentType.POST, post.getId(), requester.getId());

        if(like.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Like is not found");
        try{
            this.likeService.delete(like.get());
            post.unlike();
            this.postService.update(post);
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/messages/{messageId}/like")
    public ResponseEntity<?> likeMessage(@AuthenticationPrincipal User requester, @PathVariable int messageId) {
        Optional<Message> opt_message = this.messageService.findById(messageId);
        if(opt_message.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Message is not found");

        Message message = opt_message.get();

        CreateLikeRequest request = new CreateLikeRequest(requester, EnumLikeAttachmentType.MESSAGE, message.getId());
        
        try {
            this.likeService.create(request);
            message.like();
            this.messageService.update(message);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Like is created");
        }
    }

    @DeleteMapping("/messages/{messageId}/like")
    public ResponseEntity<?> unlikeMessage(@AuthenticationPrincipal User requester, @PathVariable int messageId) {
        Optional<Message> opt_message = this.messageService.findById(messageId);
        if(opt_message.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Message is not found");

        Message message = opt_message.get();

        Optional<Like> like = this.likeService.find(EnumLikeAttachmentType.MESSAGE, message.getId(), requester.getId());

        if(like.isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Like is not found");
        try{
            this.likeService.delete(like.get());
            message.unlike();
            this.messageService.update(message);
        }
        catch(Exception e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
        return ResponseEntity.ok().build();
    }
}
