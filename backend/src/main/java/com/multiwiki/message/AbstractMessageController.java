package com.multiwiki.message;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.multiwiki.message.requests.CreateMessageRequest;
import com.multiwiki.message.requests.MessageFilterRequest;
import com.multiwiki.user.User;

import jakarta.validation.Valid;

public abstract class AbstractMessageController <Attributes> {
    @Autowired
    private MessageService messageService;

    private final EnumAttachableTypeMessage attachableType;

    public AbstractMessageController(EnumAttachableTypeMessage attachableType){
        this.attachableType = attachableType;
    }

    @GetMapping
    public ResponseEntity<Page<Message>> getMessages(@ModelAttribute Attributes attributes, @Valid @ModelAttribute MessageFilterRequest request) {
        int attachableId;
        try {
            attachableId = this.getAttachableId(attributes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
        
        Page<Message> messages;

        if(request.getLastId() != null){
            Pageable pageable = PageRequest.of(0, request.getLimit());
            messages = this.messageService.findNextPage(this.attachableType, attachableId,  request.getLastId(), 0, pageable);
        }else{
            Pageable pageable = PageRequest.of(0, request.getLimit());
            messages = this.messageService.find(this.attachableType, attachableId, 0, pageable);
        }

        messages.forEach(message -> {
            if(message.getStatus().equals(EnumMessageStatus.DELETED.name())) {
                message.setBody("");
            }
        });

        return ResponseEntity.ok().body(messages);
    }

    @PostMapping
    public ResponseEntity<?> createMessage(@ModelAttribute Attributes attributes, @AuthenticationPrincipal User requester, @Valid @RequestBody CreateMessageRequest request) {
        int attachableId;

        try {
            attachableId = this.getAttachableId(attributes);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
        
        request.setRequester(requester);
        request.setParentId(0);
        request.setAttachableType(this.attachableType);
        request.setAttachableId(attachableId);

        try {
            Message message = this.messageService.create(request);
            return ResponseEntity.ok().body(message);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    protected abstract int getAttachableId(Attributes attributes) throws Exception;
}
