package com.multiwiki.article;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.article.requests.CreateArticleRequest;
import com.multiwiki.article.requests.DeleteArticleRequest;
import com.multiwiki.article.responses.ArticleErrorResponse;
import com.multiwiki.category.Category;
import com.multiwiki.category.CategoryService;
import com.multiwiki.staff.StaffService;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wikis/{wikiName}/categories/{categoryName}/articles")
public class ArticleController {
    @Autowired
    private ArticleService articleService;

    @Autowired
    private WikiService wikiService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private StaffService staffService;

    @GetMapping("/{name}")
    public ResponseEntity<Article> getArticle(@PathVariable("wikiName") String wikiName, @PathVariable("categoryName") String categoryName, @PathVariable("name") String name) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(categoryName, wiki.getId());
        if(opt_category.isEmpty())
            return ResponseEntity.notFound().build();
        Category category = opt_category.get();

        Optional<Article> article = this.articleService.findByNameAndWikiIdAndCategoryId(name, wiki.getId(), category.getId());
        if(article.isEmpty())
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok().body(article.get());
    }
    
    @GetMapping
    public ResponseEntity<List<Article>> getAllArticlesByCategory(@PathVariable("wikiName") String wikiName, @PathVariable("categoryName") String categoryName) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(categoryName, wiki.getId());
        if(opt_category.isEmpty())
            return ResponseEntity.notFound().build();
        Category category = opt_category.get();

        List<Article> articles = this.articleService.findByWikiIdAndCategoryId(wiki.getId(),category.getId());
        return ResponseEntity.ok().body(articles);
    }
    
    @PostMapping
    public ResponseEntity<?> createArticle(@AuthenticationPrincipal User requester, @Valid @RequestBody CreateArticleRequest request, @PathVariable("wikiName") String wikiName, @PathVariable("categoryName") String categoryName) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(categoryName, wiki.getId());
        if(opt_category.isEmpty())
            return ResponseEntity.notFound().build();
        Category category = opt_category.get();

        request.setRequester(requester);
        request.setWiki(wiki);
        request.setCategory(category);

        try {
            Article article = this.articleService.create(request);
            return ResponseEntity.ok().body(article);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ArticleErrorResponse(EnumArticleResponse.ARTICLE_URL_TAKEN));
        } catch(AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ArticleErrorResponse(EnumArticleResponse.ARTICLE_NO_RIGHTS));
        }
    }

    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteArticle(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("categoryName") String categoryName, @PathVariable("name") String name){
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(categoryName, wiki.getId());
        if(opt_category.isEmpty())
            return ResponseEntity.notFound().build();
        Category category = opt_category.get();

        DeleteArticleRequest request = new DeleteArticleRequest();
        request.setRequester(requester);
        request.setWiki(wiki);
        request.setCategory(category);
        request.setName(name);
        try {
            this.articleService.delete(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ArticleErrorResponse(EnumArticleResponse.ARTICLE_NO_RIGHTS));
        }
    }

    @PutMapping("/{name}")
    public ResponseEntity<?> changeCategory(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("categoryName") String categoryName, @PathVariable("name") String name, @Valid @RequestBody CreateArticleRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isHaveStaff(wiki.getId(), requester.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ArticleErrorResponse(EnumArticleResponse.ARTICLE_NO_RIGHTS));

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(categoryName, wiki.getId());

        if(opt_category.isEmpty())
            return ResponseEntity.notFound().build();

        Category category = opt_category.get();

        Optional<Article> opt_article = this.articleService.findByNameAndWikiIdAndCategoryId(name, wiki.getId(), category.getId());
        if(opt_article.isEmpty())
            return ResponseEntity.notFound().build();

        Article article = opt_article.get();

        if(articleService.existsByNameAndWikiIdAndCategoryId(request.getName(), wiki.getId(), category.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ArticleErrorResponse(EnumArticleResponse.ARTICLE_URL_TAKEN));

        article.setName(request.getName());
        this.articleService.update(article);

        return ResponseEntity.ok(article);
    }
}