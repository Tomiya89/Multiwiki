package com.multiwiki.message;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.multiwiki.article.Article;
import com.multiwiki.category.Category;
import com.multiwiki.message.requests.CreateMessageRequest;
import com.multiwiki.post.Post;
import com.multiwiki.wiki.Wiki;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public Optional<Message> findById(int id){
        return messageRepository.findById(id);
    }

    private Page<Message> _find(String attachableType, int attachableId, int parentId, Pageable pageable){
        return this.messageRepository.findByAttachableTypeAndAttachableIdAndParentId(attachableType, attachableId, parentId, pageable);
    }

    public Page<Message> find(EnumAttachableTypeMessage attachableType, int attachableId, int parentId, Pageable pageable){
        return this._find(attachableType.name(), attachableId, parentId, pageable);
    }

    public Page<Message> findByWiki(Wiki wiki, int parentId, Pageable pageable){
        return this._find(EnumAttachableTypeMessage.WIKI.name(), wiki.getId(), parentId, pageable);
    }

    public Page<Message> findByCategory(Category category, int parentId, Pageable pageable){
        return this._find(EnumAttachableTypeMessage.CATEGORY.name(), category.getId(), parentId, pageable);
    }

    public Page<Message> findByArticle(Article article, int parentId, Pageable pageable){
        return this._find(EnumAttachableTypeMessage.ARTICLE.name(), article.getId(), parentId, pageable);
    }

    public Page<Message> findByPost(Post post, int parentId, Pageable pageable){
        return this._find(EnumAttachableTypeMessage.POST.name(), post.getId(), parentId, pageable);
    }

    private Page<Message> _findNextPage(String attachableType, int attachableId, int lastId, int parentId, Pageable pageable){
        return this.messageRepository.findNextPage(attachableType, attachableId, parentId, lastId, pageable);
    }

    public Page<Message> findNextPage(EnumAttachableTypeMessage attachableType, int attachableId, int lastId, int parentId, Pageable pageable){
        return this._findNextPage(attachableType.name(), attachableId, lastId, parentId, pageable);
    }

    public Page<Message> findNextPageByWiki(Wiki wiki, int lastId, int parentId, Pageable pageable){
        return this._findNextPage(EnumAttachableTypeMessage.WIKI.name(), wiki.getId(), lastId, parentId, pageable);
    }

    public Page<Message> findNextPageByCategory(Category category, int lastId, int parentId, Pageable pageable){
        return this._findNextPage(EnumAttachableTypeMessage.CATEGORY.name(), category.getId(), lastId, parentId, pageable);
    }

    public Page<Message> findNextPageByArticle(Article article, int lastId, int parentId, Pageable pageable){
        return this._findNextPage(EnumAttachableTypeMessage.ARTICLE.name(), article.getId(), lastId, parentId, pageable);
    }

    public Page<Message> findNextPageByPost(Post post, int lastId, int parentId, Pageable pageable){
        return this._findNextPage(EnumAttachableTypeMessage.POST.name(), post.getId(), lastId, parentId, pageable);
    }

    public Message create(CreateMessageRequest request) throws Exception, AccessDeniedException {
        Message message = new Message();
        message.setAttachableType(request.getAttachableType().name());
        message.setAttachableId(request.getAttachableId());
        message.setParentId(request.getParentId()); 
        message.setUser(request.getRequester());
        message.setBody(request.getBody());

        return this.messageRepository.save(message);
    }

    public Message update(Message entity) {
        return this.messageRepository.save(entity);
    }

    public void delete(Message entity) throws Exception {
        entity.setStatus(EnumMessageStatus.DELETED);
        this.update(entity);
    }
}
