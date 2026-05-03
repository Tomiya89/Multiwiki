package com.multiwiki.post;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.multiwiki.post.requests.CreatePostRequest;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public Optional<Post> findPostByIdAndWikiID(int id, int wikiId){
        Optional<Post> post = this.postRepository.findById(id);
        if(post.isPresent()){
            if(post.get().getWikiId() == wikiId)
                return post;
        }
        return Optional.empty();
    }

    public Post create(CreatePostRequest request) {
        Post post = new Post();
        post.setUser(request.getRequester());
        post.setWikiId(request.getWiki().getId());
        post.setBody(request.getBody());
        post.setTitle(request.getTitle());
        return this.postRepository.save(post);
    }
    public Post update(Post entity) {
        return this.postRepository.save(entity);
    }

    public void delete(Post request) {
        request.setStatus(EnumPostStatus.DELETED);
        this.update(request);
    }

    public Page<Post> findAllByWikiId(int wikiId, Pageable pageable) {
        return postRepository.findByWikiIdAndStatusNot(
            wikiId, 
            EnumPostStatus.DELETED.name(), 
            pageable
        );
    }
}
