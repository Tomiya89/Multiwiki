package com.multiwiki.locale;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/locale")
public class LocaleController {
    @Autowired
    private LocaleService localeService;

    @GetMapping("/{name}")
    public ResponseEntity<Locale> getLocale(@PathVariable("name") String locale) {
        log.info("➡️ REQUEST: {} {}" + locale);
        Optional<Locale> opt_locale = this.localeService.findByLocale(locale);
        if(opt_locale.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok().body(opt_locale.get());
    }
    
    @GetMapping
    public ResponseEntity<List<Locale>> getAllLocale() {
        List<Locale> locales = this.localeService.findAll();
        return ResponseEntity.ok().body(locales);
    }
}
