package com.multiwiki.common.responses;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Response {
    protected EnumResponseStatus status;

    public Response() {
        this.status = EnumResponseStatus.SUCCESS;
    }

    public String getStatus(){
        return this.status.name();
    }
}
