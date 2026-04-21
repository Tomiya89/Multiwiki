package com.multiwiki.wiki;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.multiwiki.user.User;
import com.multiwiki.wiki.requests.CreateWikiRequest;

@Service
public class WikiService{
    @Autowired
    private WikiRepository wikiRepository;

    public Optional<Wiki> findById(int id){
        return this.wikiRepository.findById(id);
    }

    public Optional<Wiki> findByName(String name) throws IllegalArgumentException {
        String normalizeName = this.normalizeWikiName(name);

        return this.wikiRepository.findByName(normalizeName);
    }

    public Wiki create(CreateWikiRequest request, User requester) throws IllegalArgumentException {
        String name = this.normalizeWikiName(request.getName());

        if(this.wikiRepository.existsByName(name))
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
}