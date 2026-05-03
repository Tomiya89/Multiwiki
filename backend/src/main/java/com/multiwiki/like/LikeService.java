package com.multiwiki.like;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.multiwiki.like.requests.CreateLikeRequest;

@Service
public class LikeService {
    @Autowired
    private LikeRepository likeRepository;

    Optional<Like> find(EnumLikeAttachmentType attachmentType, int attachmentId, int userId){
        return this.likeRepository.findByAttachmentTypeAndAttachmentIdAndUserId(attachmentType.name(), attachmentId, userId);
    }

    public Like create(CreateLikeRequest request) throws Exception, AccessDeniedException {
        if(this.likeRepository.existsByAttachmentTypeAndAttachmentIdAndUserId(request.getAttachmentType().name(), request.getAttachmentId(), request.getRequester().getId()))
            throw new AccessDeniedException("Like is created");

        Like like = new Like();
        like.setAttachmentType(request.getAttachmentType());
        like.setAttachmentId(request.getAttachmentId());
        like.setUserId(request.getRequester().getId());

        return this.likeRepository.save(like);
    }

    public void delete(Like request) throws Exception {
        this.likeRepository.delete(request);
    }
}
