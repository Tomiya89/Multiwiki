package com.multiwiki.wiki;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.multiwiki.Image.Image;
import com.multiwiki.Image.ImageService;
import com.multiwiki.article.Article;
import com.multiwiki.article.ArticleService;
import com.multiwiki.category.Category;
import com.multiwiki.category.CategoryService;
import com.multiwiki.common.responses.Response;
import com.multiwiki.staff.StaffService;
import com.multiwiki.translation.EnumTranslatableType;
import com.multiwiki.translation.Translation;
import com.multiwiki.translation.TranslationDTO;
import com.multiwiki.translation.TranslationSearchDTO;
import com.multiwiki.translation.TranslationService;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.requests.CreateWikiRequest;
import com.multiwiki.wiki.responses.WikiErrorResponse;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/wikis")
public class WikiController {
    @Autowired
    private WikiService wikiService;

    @Autowired
    private ImageService imageService;

    @Autowired
    private StaffService staffService;

    @Autowired
    private TranslationService translationService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ArticleService articleService;

    @GetMapping("/{name}")
    public ResponseEntity<Wiki> getByID(@PathVariable String name) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(name);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        List<TranslationDTO> translations = translationService.findByTranslatableTypeAndTranslatableId(EnumTranslatableType.WIKI, wiki.getId()).stream().map(t -> new TranslationDTO(t)).collect(Collectors.toList());
        wiki.setTranslations(translations);

        return ResponseEntity.ok(wiki);
    }

    @GetMapping
    public ResponseEntity<Page<Wiki>> getAllWikis(
            @RequestParam(required = false, defaultValue = "") String title,
            @RequestParam(required = false, defaultValue = "en") String locale,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Wiki> wikis = this.wikiService.searchWikis(title, locale, pageable);
        
        return ResponseEntity.ok(wikis);
    }

    @GetMapping("/{name}/search")
    public ResponseEntity<Page<TranslationSearchDTO>> searchInWiki(
            @PathVariable String name,
            @RequestParam(required = false, defaultValue = "") String title,
            @PageableDefault(size = 10, sort = "title", direction = Sort.Direction.ASC) Pageable pageable) {

        Optional<Wiki> opt_wiki = this.wikiService.findByName(name);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();
                
        Page<Translation> translations = this.translationService.findByWikiIdAndTitle(wiki.getId(), title, pageable);
        
        Page<TranslationSearchDTO> transl = translations.map(translation -> {
            String url = "/wikis/" + name;
            if(translation.getTranslatableType().equals(EnumTranslatableType.CATEGORY.name())){
                Optional<Category> opt_cat = categoryService.findById(translation.getTranslatableId());
                url += "/categories/" + opt_cat.get().getName();
            }else if (translation.getTranslatableType().equals(EnumTranslatableType.ARTICLE.name())) {
                Optional<Article> opt_art = articleService.findById(translation.getTranslatableId());
                Optional<Category> opt_cat = categoryService.findById(opt_art.get().getCategoryId());
                url += "/categories/" + opt_cat.get().getName();
                url += "/articles/" + opt_art.get().getName();
            }

            return new TranslationSearchDTO(translation, url);
        });

        return ResponseEntity.ok(transl);
    }

    @PostMapping
    public ResponseEntity<?> createWiki(@AuthenticationPrincipal User requester, @Valid @RequestBody CreateWikiRequest request) {
        try {
            return ResponseEntity.ok(this.wikiService.create(request, requester));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new WikiErrorResponse(EnumWikiResponse.WIKI_URL_TAKEN));
        }
    }       

    @DeleteMapping("/{name}/background")
    public ResponseEntity<?> deleteBackgroundImage(@AuthenticationPrincipal User requester, @PathVariable String name) {
        Optional<Wiki> wiki = this.wikiService.findByName(name);
        if(wiki.isEmpty())
            return ResponseEntity.notFound().build();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.get().getUserId() && !this.staffService.isOwner(wiki.get(), requester))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new WikiErrorResponse(EnumWikiResponse.WIKI_NO_RIGHTS));

        this.imageService.deleteImage(wiki.get().getBackground());

        return ResponseEntity.ok(new Response());
    }
    
    @DeleteMapping("/{name}/card")
    public ResponseEntity<?> deleteCardImage(@AuthenticationPrincipal User requester, @PathVariable String name) {
        Optional<Wiki> wiki = this.wikiService.findByName(name);
        if(wiki.isEmpty())
            return ResponseEntity.notFound().build();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.get().getUserId() && !this.staffService.isOwner(wiki.get(), requester))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new WikiErrorResponse(EnumWikiResponse.WIKI_NO_RIGHTS));

        this.imageService.deleteImage(wiki.get().getCard());

        return ResponseEntity.ok(new Response());
    }

    @PostMapping("/{name}/background")
    public ResponseEntity<?> uploadBackgroundImage(@AuthenticationPrincipal User requester, @RequestParam("file") MultipartFile file, @PathVariable String name) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(name);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isOwner(wiki, requester))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new WikiErrorResponse(EnumWikiResponse.WIKI_NO_RIGHTS));

        if(wiki.getBackground() != null)
            this.imageService.deleteImage(wiki.getBackground());
        try {
            Image image = this.imageService.createBackground(requester, file);
            wiki.setBackground(image);
            this.wikiService.update(wiki);
            return ResponseEntity.ok().body(image);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{name}/card")
    public ResponseEntity<?> uploadCardImage(@AuthenticationPrincipal User requester, @RequestParam("file") MultipartFile file, @PathVariable String name) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(name);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isOwner(wiki, requester))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new WikiErrorResponse(EnumWikiResponse.WIKI_NO_RIGHTS));

        if(wiki.getCard() != null)
            this.imageService.deleteImage(wiki.getCard());
        try {
            Image image = this.imageService.createCard(requester, file);
            wiki.setCard(image);
            this.wikiService.update(wiki);
            return ResponseEntity.ok().body(image);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{name}")
    public ResponseEntity<?> changeWiki(@AuthenticationPrincipal User requester, @PathVariable String name, @Valid @RequestBody CreateWikiRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(name);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isOwner(wiki, requester))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new WikiErrorResponse(EnumWikiResponse.WIKI_NO_RIGHTS));

        if(wikiService.existsByName(request.getName()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new WikiErrorResponse(EnumWikiResponse.WIKI_URL_TAKEN));

        wiki.setName(request.getName());
        this.wikiService.update(wiki);

        return ResponseEntity.ok(wiki);
    }
}