package com.multiwiki.translation;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TranslationRepository extends JpaRepository<Translation, Integer>, JpaSpecificationExecutor<Translation>{
    public Optional<Translation> findByTranslatableTypeAndTranslatableIdAndLocale(String translatableType, int translatableId, String locale);

    public List<Translation> findByTranslatableTypeAndTranslatableId(String translatableType, int translatableId);

    public boolean existsByTranslatableTypeAndTranslatableIdAndLocale(String translatableType, int translatableId, String locale);
}
