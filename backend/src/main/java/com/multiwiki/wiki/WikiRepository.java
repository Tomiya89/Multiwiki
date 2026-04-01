package com.multiwiki.wiki;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;


@Repository
public interface WikiRepository extends JpaRepository<Wiki, Integer>, JpaSpecificationExecutor<Wiki> {
    public Optional<Wiki> findByName(String name);

    boolean existsByName(String name);
}
