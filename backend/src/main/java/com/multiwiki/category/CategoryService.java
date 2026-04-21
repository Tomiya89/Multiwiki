package com.multiwiki.category;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.multiwiki.category.requests.CreateCategoryRequest;
import com.multiwiki.category.requests.DeleteCategoryRequest;
import com.multiwiki.staff.StaffService;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

@Service
public class CategoryService{
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StaffService staffService;

    public Optional<Category> findById(int id){
        return this.categoryRepository.findById(id);
    }

    public Optional<Category> findByNameAndWikiId(String name, int wikiId){
        String normalizedName = this.normalizeCategoryName(name);
        return this.categoryRepository.findByNameAndWikiId(normalizedName, wikiId);
    }

    public List<Category> findByWikiId(int wikiId){
        return this.categoryRepository.findByWikiId(wikiId);
    }

    public boolean existsByNameAndWikiId(String name, Integer wikiId){
        return this.categoryRepository.existsByNameAndWikiId(name, wikiId);
    }

    public Category create(CreateCategoryRequest request) throws AccessDeniedException, DataIntegrityViolationException {
        String name = this.normalizeCategoryName(request.getName());

        if(this.categoryRepository.existsByNameAndWikiId(name, request.getWiki().getId()))
            throw new DataIntegrityViolationException("Name is busy");

        Wiki wiki = request.getWiki();
        User requester = request.getRequester();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isHaveStaff(wiki.getId(), requester.getId()))
            throw new AccessDeniedException("У вас нет прав");

        Category category = new Category();

        category.setUserId(requester.getId());
        category.setWikiId(wiki.getId());
        category.setName(name);

        return this.categoryRepository.save(category);
    }

    public void delete(DeleteCategoryRequest request) throws AccessDeniedException, IllegalArgumentException{
        String name = this.normalizeCategoryName(request.getName());

        Optional<Category> category = this.categoryRepository.findByNameAndWikiId(name, request.getWiki().getId());
        if(category.isEmpty())
            return;

        User requester = request.getRequester();

        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != category.get().getUserId() && !this.staffService.isHaveStaff(request.getWiki().getId(), requester.getId()))
            throw new AccessDeniedException("У вас нет прав");

        this.categoryRepository.delete(category.get());
    }

    private String normalizeCategoryName(String name) throws IllegalArgumentException {
        if (name == null || name.trim().isEmpty())
            throw new IllegalArgumentException("Название категории не может быть пустым");

        return name.trim().toLowerCase().replaceAll("\\s+", "_");
    }

    public Category update(Category entity){
        return this.categoryRepository.save(entity);
    }
}
