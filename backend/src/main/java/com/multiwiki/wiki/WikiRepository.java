package com.multiwiki.wiki;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;


@Repository
public interface WikiRepository extends JpaRepository<Wiki, Integer>, JpaSpecificationExecutor<Wiki> {
    public Optional<Wiki> findByName(String name);

    boolean existsByName(String name);

    Page<Wiki> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Wiki> findByUserId(int userId, Pageable pageable);
}
