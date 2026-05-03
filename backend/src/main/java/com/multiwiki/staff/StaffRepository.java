package com.multiwiki.staff;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer>, JpaSpecificationExecutor<Staff>{
    public List<Staff> findByWiki(Wiki wiki);

    public Optional<Staff> findByWikiAndUser(Wiki wiki, User user);
    
    boolean existsByWikiAndUser(Wiki wiki, User user);

    Page<Staff> findByWiki(Wiki wiki, Pageable pageable);
    
    @Query(value = "SELECT s FROM Staff s JOIN FETCH s.user WHERE s.wiki = :wiki",
           countQuery = "SELECT count(s) FROM Staff s WHERE s.wiki = :wiki")
    Page<Staff> findByWikiWithUser(@Param("wiki") Wiki wiki, Pageable pageable);

    @Query(value = "SELECT s FROM Staff s JOIN FETCH s.user WHERE s.wiki = :wiki AND LOWER(s.user.username) LIKE LOWER(concat('%', :username, '%'))",
           countQuery = "SELECT count(s) FROM Staff s WHERE s.wiki = :wiki AND LOWER(s.user.username) LIKE LOWER(concat('%', :username, '%'))")
    Page<Staff> findByWikiAndUserUsernameContainingIgnoreCase(@Param("wiki") Wiki wiki, 
                                                                @Param("username") String username, 
                                                                Pageable pageable);

    public Page<Staff> findByUser(User user, Pageable pageable);
}
