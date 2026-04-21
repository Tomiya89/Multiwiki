package com.multiwiki.category;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer>, JpaSpecificationExecutor<Category>{
    public Optional<Category> findByNameAndWikiId(String name, Integer wikiId);

    public List<Category> findByWikiId(int wikiID);

    public boolean existsByNameAndWikiId(String name, Integer wikiId);
}
