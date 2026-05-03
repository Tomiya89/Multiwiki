package com.multiwiki.translation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TranslationRepository extends JpaRepository<Translation, Integer>, JpaSpecificationExecutor<Translation>{
    public Optional<Translation> findByTranslatableTypeAndTranslatableIdAndLocale(String translatableType, int translatableId, String locale);

    public List<Translation> findByTranslatableTypeAndTranslatableId(String translatableType, int translatableId);

    public boolean existsByTranslatableTypeAndTranslatableIdAndLocale(String translatableType, int translatableId, String locale);

    @Query("SELECT t FROM Translation t WHERE t.translatableType = 'WIKI' " +
           "AND t.locale = :locale " +
           "AND LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Translation> findWikisByLocalizedTitle(
            @Param("title") String title, 
            @Param("locale") String locale, 
            Pageable pageable
    );

    public Page<Translation> findByWikiIdAndTitleContainingIgnoreCase(int wikiId, String title, Pageable pageable);
}
