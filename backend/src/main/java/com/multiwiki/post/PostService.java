package com.multiwiki.post;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.multiwiki.post.requests.CreatePostRequest;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import jakarta.persistence.criteria.Predicate;

@Service
public class PostService {
    @Autowired
    private PostRepository postRepository;

    public Optional<Post> findPostByIdAndWikiID(int id, int wikiId){
        Optional<Post> post = this.postRepository.findById(id);
        if(post.isPresent()){
            if(post.get().getWiki().getId() == wikiId)
                return post;
        }
        return Optional.empty();
    }

    public Post create(CreatePostRequest request) {
        Post post = new Post();
        post.setUser(request.getRequester());
        post.setWiki(request.getWiki());
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

    public Page<Post> findAllByWikiId(Wiki wiki, String title, Pageable pageable) {
        Specification<Post> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("wiki"), wiki));

            predicates.add(cb.notEqual(root.get("status"), EnumPostStatus.DELETED.name()));

            if (title != null && !title.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return postRepository.findAll(spec, pageable);
    }

    public Page<Post> findAllByUser(User user, Pageable pageable){
        Specification<Post> spec = (root, query, cb) -> {
        List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user"), user));

            predicates.add(cb.notEqual(root.get("status"), EnumPostStatus.DELETED.name()));

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return postRepository.findAll(spec, pageable);
    }
}
