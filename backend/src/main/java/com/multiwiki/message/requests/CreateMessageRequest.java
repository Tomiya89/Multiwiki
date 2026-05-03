package com.multiwiki.message.requests;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.multiwiki.message.EnumAttachableTypeMessage;
import com.multiwiki.user.User;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateMessageRequest {
    @JsonIgnore
    private User requester;

    @NotBlank(message = "Body is required")
    private String body;

    @JsonIgnore
    private int parentId;
    @JsonIgnore
    private int attachableId;
    @JsonIgnore
    private EnumAttachableTypeMessage attachableType;

    public CreateMessageRequest(String body) {
        this.body = body;
    }
}
