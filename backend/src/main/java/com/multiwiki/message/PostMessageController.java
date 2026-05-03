package com.multiwiki.message;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.message.attributes.PostMessageAttributes;
import com.multiwiki.post.Post;
import com.multiwiki.post.PostService;
import com.multiwiki.wiki.Wiki;
import com.multiwiki.wiki.WikiService;

@RestController
@RequestMapping("/api/wikis/{wikiName}/posts/{postId}/messages")
public class PostMessageController extends AbstractMessageController<PostMessageAttributes> {
    @Autowired
    private WikiService wikiService;

    @Autowired
    private PostService postService;

    public PostMessageController() {
        super(EnumAttachableTypeMessage.POST);
    }

    @Override
    protected int getAttachableId(PostMessageAttributes attributes) throws Exception {
        Optional<Wiki> opt_wiki = this.wikiService.findByName(attributes.getWikiName());
        if(opt_wiki.isEmpty())
            throw new Exception("Not found");

        Optional<Post> opt_post = this.postService.findPostByIdAndWikiID(attributes.getPostId(), opt_wiki.get().getId());
        if(opt_post.isEmpty())
            throw new Exception("Not found");

        return opt_post.get().getId();
    }
    
}
