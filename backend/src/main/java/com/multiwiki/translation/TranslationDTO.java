package com.multiwiki.translation;

import lombok.Data;

@Data
public class TranslationDTO {
    private int id;

    private String locale;

    private String title;

    public TranslationDTO(Translation translation){
        this.id = translation.getId();
        this.locale = translation.getLocale();
        this.title = translation.getTitle();
    }
}
