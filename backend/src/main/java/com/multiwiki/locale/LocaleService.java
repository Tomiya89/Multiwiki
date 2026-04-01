package com.multiwiki.locale;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class LocaleService {
    @Autowired
    private LocaleRepository localeRepository;

    public Optional<Locale> findByLocale(String locale){
        return this.localeRepository.findByLocale(locale);
    }

    public List<Locale> findAll(){
        return this.localeRepository.findAll();
    }
}
