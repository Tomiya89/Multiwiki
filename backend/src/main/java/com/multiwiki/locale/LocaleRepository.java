package com.multiwiki.locale;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LocaleRepository extends JpaRepository<Locale, String>, JpaSpecificationExecutor<Locale>{
    public Optional<Locale> findByLocale(String locale);

    public boolean existsByLocale(String locale);
}
