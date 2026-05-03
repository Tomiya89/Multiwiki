package com.multiwiki.message;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.message.attributes.WikiMessageAttributes;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

@RestController
@RequestMapping("/api/wikis/{wikiName}/messages")
public class WikiMessageController extends AbstractMessageController<WikiMessageAttributes> {
    @Autowired
    private WikiService wikiService;

    public WikiMessageController() {
        super(EnumAttachableTypeMessage.WIKI);
    }

    @Override
    protected int getAttachableId(WikiMessageAttributes attributes) throws Exception {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(attributes.getWikiName());
        if(opt_wiki.isEmpty())
            throw new Exception("Not found");
        return opt_wiki.get().getId();
    }
    
}
