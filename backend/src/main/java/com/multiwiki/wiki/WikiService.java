package com.multiwiki.wiki;

import java.util.Collections;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.multiwiki.translation.Translation;
import com.multiwiki.translation.TranslationDTO;
import com.multiwiki.translation.TranslationRepository;
import com.multiwiki.user.User;
import com.multiwiki.wiki.requests.CreateWikiRequest;

@Service
public class WikiService{
    @Autowired
    private WikiRepository wikiRepository;

    @Autowired
    private TranslationRepository translationRepository;

    public Page<Wiki> searchWikis(String title, String locale, Pageable pageable) {
        String searchLocale = (locale == null || locale.isEmpty()) ? "en" : locale;
        
        Page<Translation> translations = translationRepository.findWikisByLocalizedTitle(title, searchLocale, pageable);
        
        return translations.map(t -> {
            Wiki wiki = wikiRepository.findById(t.getTranslatableId())
                                     .orElseThrow(() -> new RuntimeException("Wiki not found"));
            
            wiki.setTranslations(Collections.singletonList(new TranslationDTO(t)));
            return wiki;
        });
    }

    public Optional<Wiki> findById(int id){
        return this.wikiRepository.findById(id);
    }

    public Optional<Wiki> findByName(String name) throws IllegalArgumentException {
        String normalizeName = this.normalizeWikiName(name);

        return this.wikiRepository.findByName(normalizeName);
    }

    public Wiki create(CreateWikiRequest request, User requester) throws IllegalArgumentException {
        String name = this.normalizeWikiName(request.getName());

        if(this.wikiRepository.existsByName(name) || name.trim().toLowerCase().equals("search"))
            throw new RuntimeException("Wiki exists with name");

        Wiki wiki = new Wiki();
        wiki.setName(name);
        wiki.setUserId(requester.getId());

        return wikiRepository.save(wiki);
    }

    public Wiki update(Wiki entity) {
        return this.wikiRepository.save(entity);
    }

    private String normalizeWikiName(String name) throws IllegalArgumentException {
        if (name == null || name.trim().isEmpty())
            throw new IllegalArgumentException("Wiki name is not should be empty");

        return name.trim().toLowerCase().replaceAll("\\s+", "_");
    }

    public boolean existsByName(String name){
        return this.wikiRepository.existsByName(name);
    }

    public Page<Wiki> findByUserId(int userId, Pageable pageable){
        return this.wikiRepository.findByUserId(userId, pageable);
    }
}