package com.multiwiki.common.responses;


public abstract class ErrorResponse<T> extends Response {
    protected T error;

    public ErrorResponse(T error) {
        super(EnumResponseStatus.ERROR);
        this.error = error;
    }
    
    public abstract String getError();
}
