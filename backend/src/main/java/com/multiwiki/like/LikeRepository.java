package com.multiwiki.like;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface LikeRepository extends JpaRepository<Like, Integer>, JpaSpecificationExecutor<Like> {
    Optional<Like> findByAttachmentTypeAndAttachmentIdAndUserId(String attachmentType, int attachmentId, int userId);

    boolean existsByAttachmentTypeAndAttachmentIdAndUserId(String attachmentType, int attachmentId, int userId);
}
