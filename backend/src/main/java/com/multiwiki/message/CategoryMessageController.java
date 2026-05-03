package com.multiwiki.message;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.category.Category;
import com.multiwiki.category.CategoryService;
import com.multiwiki.message.attributes.CategoryMessageAttributes;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

@RestController
@RequestMapping("/api/wikis/{wikiName}/categories/{categoryName}/messages")
public class CategoryMessageController extends AbstractMessageController<CategoryMessageAttributes> {
    @Autowired
    private WikiService wikiService;

    @Autowired
    private CategoryService categoryService;

    public CategoryMessageController() {
        super(EnumAttachableTypeMessage.CATEGORY);
    }
    @Override
    protected int getAttachableId(CategoryMessageAttributes attributes) throws Exception {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(attributes.getWikiName());
        if(opt_wiki.isEmpty())
            throw new Exception("Not found");

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(attributes.getCategoryName(), opt_wiki.get().getId());
        if(opt_category.isEmpty())
            throw new Exception("Not found");
        return opt_category.get().getId();
    }
    
}
