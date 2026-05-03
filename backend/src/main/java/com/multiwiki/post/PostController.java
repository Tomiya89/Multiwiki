package com.multiwiki.post;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.like.EnumLikeAttachmentType;
import com.multiwiki.like.LikeService;
import com.multiwiki.post.requests.CreatePostRequest;
import com.multiwiki.post.requests.UpdatePostRequest;
import com.multiwiki.post.responses.PostErrorResponse;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/wikis/{wikiName}/posts")
public class PostController {
    @Autowired 
    private WikiService wikiService;

    @Autowired
    private PostService postService;

    @Autowired
    private LikeService likeService;

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            @PathVariable String wikiName,
            @RequestParam(required = false) String title,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if (opt_wiki.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Wiki wiki = opt_wiki.get();
        Page<Post> posts = this.postService.findAllByWikiId(wiki.getId(), title, pageable);
        
        return ResponseEntity.ok().body(posts.map(post -> new PostDTO(post)));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostDTO> getPost(@AuthenticationPrincipal User requester, @PathVariable String wikiName, @PathVariable int postId) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        Optional<Post> opt_post = this.postService.findPostByIdAndWikiID(postId, wiki.getId());
        
        if(opt_post.isEmpty() || opt_post.get().isDeleted())
            return ResponseEntity.notFound().build();

        Post post = opt_post.get();

        if(requester != null){
            if(likeService.isLiked(EnumLikeAttachmentType.MESSAGE, post.getId(), requester.getId()))
                post.setLiked(true);
        }

        return ResponseEntity.ok().body(new PostDTO(post));
    }
    
    @PostMapping
    public ResponseEntity<?> createPost(@PathVariable String wikiName, @AuthenticationPrincipal User requester, @Valid @RequestBody CreatePostRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        request.setWiki(wiki);
        request.setRequester(requester);
        Post post = this.postService.create(request);
        return ResponseEntity.ok().body(post);
    }
    
    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(@PathVariable String wikiName, @PathVariable int postId, @AuthenticationPrincipal User requester, @Valid @RequestBody UpdatePostRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        Optional<Post> opt_post = this.postService.findPostByIdAndWikiID(postId, wiki.getId());
        if(opt_post.isEmpty())
            return ResponseEntity.notFound().build();

        Post post = opt_post.get();

        if(post.isDeleted())
            return ResponseEntity.notFound().build();

        if(post.getUser().getId() != requester.getId() && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new PostErrorResponse(EnumPostResponse.POST_NO_RIGTHS));

        post.setBody(request.getBody());
        post.setTitle(request.getTitle());

        return ResponseEntity.ok().body(this.postService.update(post));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String wikiName, @PathVariable int postId, @AuthenticationPrincipal User requester){
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        Optional<Post> opt_post = this.postService.findPostByIdAndWikiID(postId, wiki.getId());
        if(opt_post.isEmpty())
            return ResponseEntity.notFound().build();

        Post post = opt_post.get();
        if(post.getUser().getId() != requester.getId() && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new PostErrorResponse(EnumPostResponse.POST_NO_RIGTHS));

        this.postService.delete(post);

        return ResponseEntity.ok().build();
    }
}
