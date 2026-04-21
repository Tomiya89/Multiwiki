package com.multiwiki.category;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.category.requests.CreateCategoryRequest;
import com.multiwiki.category.requests.DeleteCategoryRequest;
import com.multiwiki.category.responses.CategoryErrorResponse;
import com.multiwiki.common.responses.Response;
import com.multiwiki.staff.StaffService;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/wikis/{wikiName}/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private WikiService wikiService;
    
    @Autowired
    private StaffService staffService;

    @GetMapping("/{name}")
    public ResponseEntity<Category> getCategoryByName(@PathVariable("wikiName") String wikiName, @PathVariable("name") String name) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        Optional<Category> category = this.categoryService.findByNameAndWikiId(name, wiki.getId());
        if(category.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok().body(category.get());
    }
    
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategoriesByWiki(@PathVariable("wikiName") String wikiName) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        return ResponseEntity.ok().body(this.categoryService.findByWikiId(wiki.getId()));
    }
    
    @PostMapping
    public ResponseEntity<?> createCategory(@AuthenticationPrincipal User requester, @Valid @RequestBody CreateCategoryRequest request, @PathVariable("wikiName") String wikiName) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        request.setRequester(requester);
        request.setWiki(wiki);

        try {
            Category category = this.categoryService.create(request);
            return ResponseEntity.ok().body(category);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new CategoryErrorResponse(EnumCategoryResponse.CATEGORY_URL_TAKEN));
        }catch(AccessDeniedException e){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new CategoryErrorResponse(EnumCategoryResponse.CATEGORY_NO_RIGHTS));
        }
    }
    
    @DeleteMapping("/{name}")
    public ResponseEntity<?> deleteCategory(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("name") String name){
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();
        Wiki wiki = opt_wiki.get();

        DeleteCategoryRequest request = new DeleteCategoryRequest();
        request.setName(name);
        request.setRequester(requester);
        request.setWiki(wiki);

        try {
            this.categoryService.delete(request);
            return ResponseEntity.ok(new Response());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new CategoryErrorResponse(EnumCategoryResponse.CATEGORY_NO_RIGHTS));
        }
    }

    @PutMapping("/{name}")
    public ResponseEntity<?> changeCategory(@AuthenticationPrincipal User requester, @PathVariable("wikiName") String wikiName, @PathVariable("name") String name, @Valid @RequestBody CreateCategoryRequest request) {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(wikiName);
        if(opt_wiki.isEmpty())
            return ResponseEntity.notFound().build();

        Wiki wiki = opt_wiki.get();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isHaveStaff(wiki.getId(), requester.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new CategoryErrorResponse(EnumCategoryResponse.CATEGORY_NO_RIGHTS));

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(name, wiki.getId());

        if(opt_category.isEmpty())
            return ResponseEntity.notFound().build();

        Category category = opt_category.get();

        if(categoryService.existsByNameAndWikiId(request.getName(), wiki.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new CategoryErrorResponse(EnumCategoryResponse.CATEGORY_URL_TAKEN));

        category.setName(request.getName());
        this.categoryService.update(category);

        return ResponseEntity.ok(category);
    }
}
