package com.multiwiki.message;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.multiwiki.like.EnumLikeAttachmentType;
import com.multiwiki.like.LikeService;
import com.multiwiki.message.attributes.MessageMessageAttributes;
import com.multiwiki.message.requests.CreateMessageRequest;
import com.multiwiki.message.requests.MessageFilterRequest;
import com.multiwiki.user.User;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @Autowired
    private LikeService likeService;

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@AuthenticationPrincipal User requester, @PathVariable int messageId){
        Optional<Message> opt_message = this.messageService.findById(messageId);
        if(opt_message.isEmpty())
            return ResponseEntity.notFound().build();

        Message message = opt_message.get();

        if(message.getUser().getId() != requester.getId() && !requester.isAdmin())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");

        try {
            this.messageService.delete(message);
        } catch (Exception e) {
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{messageId}/messages")
    public ResponseEntity<Page<Message>> getMessages(@AuthenticationPrincipal User requester, @ModelAttribute MessageMessageAttributes attributes, @Valid @ModelAttribute MessageFilterRequest request) {
        Optional<Message> opt_message = this.messageService.findById(attributes.getMessageId());
        if(opt_message.isEmpty()) return ResponseEntity.notFound().build();
        
        Message ownMessage = opt_message.get();
        Page<Message> page;
        Pageable pageable = PageRequest.of(0, request.getLimit());

        if(request.getLastId() != null){
            page = this.messageService.findNextPage(
                EnumAttachableTypeMessage.valueOf(ownMessage.getAttachableType()), 
                ownMessage.getAttachableId(), 
                request.getLastId(), 
                ownMessage.getId(), 
                pageable
            );
        } else {
            page = this.messageService.find(
                EnumAttachableTypeMessage.valueOf(ownMessage.getAttachableType()), 
                ownMessage.getAttachableId(), 
                ownMessage.getId(), 
                pageable
            );
        }

        page.forEach(message -> {
            if(requester != null){
                if(likeService.isLiked(EnumLikeAttachmentType.MESSAGE, message.getId(), requester.getId()))
                   message.setLiked(true);
            }
            if(message.getStatus().equals(EnumMessageStatus.DELETED.name())) {
                message.setBody("");
            }
        });

        return ResponseEntity.ok().body(page);
    }

    @PostMapping("/{messageId}/messages")
    public ResponseEntity<?> createMessage(@ModelAttribute MessageMessageAttributes attributes, @AuthenticationPrincipal User requester, @Valid @RequestBody CreateMessageRequest request) {
        Optional<Message> opt_message = this.messageService.findById(attributes.getMessageId());
        if(opt_message.isEmpty())
            return ResponseEntity.notFound().build();
        
        Message ownMessage = opt_message.get();
        // if(ownMessage.isDeleted())
        //     return ResponseEntity.notFound().build();
        
        request.setRequester(requester);
        request.setParentId(ownMessage.getId());
        request.setAttachableType(EnumAttachableTypeMessage.valueOf(ownMessage.getAttachableType()));
        request.setAttachableId(ownMessage.getAttachableId());

        try {
            Message message = this.messageService.create(request);
            return ResponseEntity.ok().body(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
