package com.multiwiki.staff;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Integer>, JpaSpecificationExecutor<Staff>{
    public List<Staff> findByWikiId(int wikiId);

    public Optional<Staff> findByWikiIdAndUserId(int wikiId, int userId);
    
    boolean existsByWikiIdAndUserId(int wikiId, int userId);
}
