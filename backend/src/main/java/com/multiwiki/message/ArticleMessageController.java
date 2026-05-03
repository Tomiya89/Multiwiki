package com.multiwiki.message;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.article.Article;
import com.multiwiki.article.ArticleService;
import com.multiwiki.category.Category;
import com.multiwiki.category.CategoryService;
import com.multiwiki.message.attributes.ArticleMessageAttributes;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

@RestController
@RequestMapping("/api/wikis/{wikiName}/categories/{categoryName}/articles/{articleName}/messages")
public class ArticleMessageController extends AbstractMessageController<ArticleMessageAttributes> {
    @Autowired
    private WikiService wikiService;

    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private ArticleService articleService;

    public ArticleMessageController() {
        super(EnumAttachableTypeMessage.ARTICLE);
    }

    @Override
    protected int getAttachableId(ArticleMessageAttributes attributes) throws Exception {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(attributes.getWikiName());
        if(opt_wiki.isEmpty())
            throw new Exception("Not found");

        Optional<Category> opt_category = this.categoryService.findByNameAndWikiId(attributes.getCategoryName(), opt_wiki.get().getId());
        if(opt_category.isEmpty())
            throw new Exception("Not found");

        Optional<Article> opt_article = this.articleService.findByNameAndWikiIdAndCategoryId(attributes.getArticleName(), opt_wiki.get().getId(), opt_category.get().getId());
        if(opt_article.isEmpty())
            throw new Exception("Not found");

        return opt_article.get().getId();
    }
    
}
