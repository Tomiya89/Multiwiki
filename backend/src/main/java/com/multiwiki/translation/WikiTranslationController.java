package com.multiwiki.translation;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.staff.StaffService;
import com.multiwiki.translation.requests.CreateTranslationRequest;
import com.multiwiki.translation.requests.UpdateTranslationRequest;
import com.multiwiki.translation.responses.TranslationErrorResponse;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/wikis/{wikiName}/translations")
public class WikiTranslationController {
    @Autowired
    private TranslationService translationService;

    @Autowired
    private WikiService wikiService;

    @Autowired
    private StaffService staffService;

    @GetMapping
    public ResponseEntity<List<Translation>> getWikiTranslations(@PathVariable("wikiName") String wikiName) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        List<Translation> translations = this.translationService.findByTranslatableTypeAndTranslatableId(EnumTranslatableType.WIKI, opt_wiki.get().getId());
        return ResponseEntity.ok().body(translations);
    }
    
    @GetMapping("/{locale}")
    public ResponseEntity<Translation> getWikiTranslation(@PathVariable("wikiName") String wikiName, @PathVariable("locale") String locale) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Optional<Translation> translation = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(EnumTranslatableType.WIKI, opt_wiki.get().getId(), locale);
        if(translation.isEmpty())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok().body(translation.get());
    }
    
    @PostMapping
    public ResponseEntity<?> createTranslation(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @Valid @RequestBody CreateTranslationRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        request.setRequester(requester);
        request.setType(EnumTranslatableType.WIKI);
        request.setId(opt_wiki.get().getId());
        request.setWiki(opt_wiki.get());

        try{
            Translation translation = this.translationService.create(request);
            return ResponseEntity.ok().body(translation);
        }
        catch(AccessDeniedException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new TranslationErrorResponse(EnumTranslationResponse.TRANSLATION_NO_RIGHTS));
        }
        catch(IllegalArgumentException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new TranslationErrorResponse(EnumTranslationResponse.LOCALE_IS_UNDEFINED));
        }
    }
    
    @PutMapping("/{locale}")
    public ResponseEntity<?> updateTranslation(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("locale") String locale, @Valid @RequestBody UpdateTranslationRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isHaveStaff(wiki.getId(), requester.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new TranslationErrorResponse(EnumTranslationResponse.TRANSLATION_NO_RIGHTS));

        Optional<Translation> opt_translation = this.translationService.findByTranslatableTypeAndTranslatableIdAndLocale(EnumTranslatableType.WIKI, wiki.getId(), locale);
        if(opt_translation.isEmpty())
            return ResponseEntity.notFound().build();

        Translation translation = opt_translation.get();
        translation.setBody(request.getBody());
        translation.setTitle(request.getTitle());

        return ResponseEntity.ok().body(this.translationService.update(translation));
    }
}
