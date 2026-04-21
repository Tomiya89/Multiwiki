package com.multiwiki.article;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.multiwiki.article.requests.CreateArticleRequest;
import com.multiwiki.article.requests.DeleteArticleRequest;
import com.multiwiki.category.Category;
import com.multiwiki.staff.StaffService;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

@Service
public class ArticleService {
    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private StaffService staffService;

    public Optional<Article> findByNameAndWikiIdAndCategoryId(String name, int wikiId, int categoryId){
        String normalizedName = this.normalizeArticleName(name);
        return this.articleRepository.findByNameAndWikiIdAndCategoryId(normalizedName, wikiId, categoryId);
    }

    public List<Article> findByWikiIdAndCategoryId(int wikiId, int categoryId){
        return this.articleRepository.findByWikiIdAndCategoryId(wikiId, categoryId);
    }

    public boolean existsByNameAndWikiIdAndCategoryId(String name, int wikiId, int categoryId){
        return this.articleRepository.existsByNameAndWikiIdAndCategoryId(name, wikiId, categoryId);
    }

    public Article create(CreateArticleRequest request) throws AccessDeniedException, DataIntegrityViolationException {
        String name = this.normalizeArticleName(request.getName());

        Wiki wiki = request.getWiki();
        Category category = request.getCategory();
        User requester = request.getRequester();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isHaveStaff(wiki.getId(), requester.getId()))
            throw new AccessDeniedException("У вас нет прав");

        if(this.articleRepository.existsByNameAndWikiIdAndCategoryId(name, wiki.getId(), category.getId()))
            throw new DataIntegrityViolationException("Name is busy");

        Article article = new Article();
        article.setName(name);

        article.setWikiId(wiki.getId());
        article.setCategoryId(category.getId());
        article.setUserId(requester.getId());

        return this.articleRepository.save(article);
    }

    public void delete(DeleteArticleRequest request) throws Exception {
        String name = this.normalizeArticleName(request.getName());

        Wiki wiki = request.getWiki();
        Category category = request.getCategory();
        User requester = request.getRequester();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isHaveStaff(wiki.getId(), requester.getId()))
            throw new AccessDeniedException("У вас нет прав");

        Optional<Article> article = this.articleRepository.findByNameAndWikiIdAndCategoryId(name, wiki.getId(), category.getId());
        if(article.isEmpty())
            return;

        this.articleRepository.delete(article.get());
    }

    private String normalizeArticleName(String name) throws IllegalArgumentException {
        if (name == null || name.trim().isEmpty())
            throw new IllegalArgumentException("Название статьи не может быть пустым");

        return name.trim().toLowerCase().replaceAll("\\s+", "_");
    }

    public Article update(Article entity){
        return this.articleRepository.save(entity);
    }
}
