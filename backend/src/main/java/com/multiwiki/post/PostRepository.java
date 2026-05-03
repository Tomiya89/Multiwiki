package com.multiwiki.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

public interface PostRepository extends JpaRepository<Post, Integer>, JpaSpecificationExecutor<Post> {
    Page<Post> findByWikiAndStatusNot(Wiki wiki, String status, Pageable pageable);
    
    Page<Post> findByUserAndStatusNot(User user, String status, Pageable pageable);
}
