package com.multiwiki.article;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer>, JpaSpecificationExecutor<Article> {
    public Optional<Article> findByNameAndWikiIdAndCategoryId(String name, int wikiId, int categoryId);

    public List<Article> findByWikiIdAndCategoryId(int wikiId, int categoryId);

    public boolean existsByNameAndWikiIdAndCategoryId(String name, int wikiId, int categoryId);
}
