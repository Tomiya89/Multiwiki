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

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer>, JpaSpecificationExecutor<Staff>{
    public List<Staff> findByWikiId(int wikiId);

    public Optional<Staff> findByWikiIdAndUserId(int wikiId, int userId);
    
    boolean existsByWikiIdAndUserId(int wikiId, int userId);

    Page<Staff> findByWikiId(int wikiId, Pageable pageable);
    
    @Query(value = "SELECT s FROM Staff s JOIN FETCH s.user WHERE s.wikiId = :wikiId",
           countQuery = "SELECT count(s) FROM Staff s WHERE s.wikiId = :wikiId")
    Page<Staff> findByWikiIdWithUser(@Param("wikiId") int wikiId, Pageable pageable);

    @Query(value = "SELECT s FROM Staff s JOIN FETCH s.user WHERE s.wikiId = :wikiId AND LOWER(s.user.username) LIKE LOWER(concat('%', :username, '%'))",
           countQuery = "SELECT count(s) FROM Staff s WHERE s.wikiId = :wikiId AND LOWER(s.user.username) LIKE LOWER(concat('%', :username, '%'))")
    Page<Staff> findByWikiIdAndUserUsernameContainingIgnoreCase(@Param("wikiId") int wikiId, 
                                                                @Param("username") String username, 
                                                                Pageable pageable);
}
