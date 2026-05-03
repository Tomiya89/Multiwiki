package com.multiwiki.translation;

import lombok.Data;

@Data
public class TranslationSearchDTO {
    private int id;

    private String locale;

    private String translatableType;

    private String title;

    private String url;

    public TranslationSearchDTO(Translation translation, String url){
        this.id = translation.getId();
        this.locale = translation.getLocale();
        this.title = translation.getTitle();
        this.translatableType = translation.getTranslatableType();
        this.url = url;
    }
}
