package com.multiwiki.like.requests;

import com.multiwiki.like.EnumLikeAttachmentType;
import com.multiwiki.user.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLikeRequest {
    private User requester;

    private EnumLikeAttachmentType attachmentType;

    private int attachmentId;
}
