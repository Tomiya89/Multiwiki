package com.multiwiki.translation;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.multiwiki.locale.LocaleRepository;
import com.multiwiki.staff.StaffService;
import com.multiwiki.translation.requests.CreateTranslationRequest;
import com.multiwiki.user.EnumUserRole;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

@Service
public class TranslationService {
    @Autowired
    private TranslationRepository translationRepository;

    @Autowired
    private LocaleRepository localeRepository;

    @Autowired
    private StaffService staffService;

    public Optional<Translation> findByTranslatableTypeAndTranslatableIdAndLocale(Enum translatableType, int translatableId, String locale) throws IllegalArgumentException{
        if(!this.localeRepository.existsByLocale(locale))
            throw new IllegalArgumentException("Такого языка не существует");

        return this.translationRepository.findByTranslatableTypeAndTranslatableIdAndLocale(translatableType.name(), translatableId, locale);
    }

    public List<Translation> findByTranslatableTypeAndTranslatableId(Enum translatableType, int translatableId){
        return this.translationRepository.findByTranslatableTypeAndTranslatableId(translatableType.name(), translatableId);
    }

    public Translation create(CreateTranslationRequest request) throws IllegalArgumentException, AccessDeniedException {
        if(!localeRepository.existsByLocale(request.getLocale()))
            throw new IllegalArgumentException("Такого языка не существует");

        if(this.translationRepository.existsByTranslatableTypeAndTranslatableIdAndLocale(request.getType().name(), request.getId(), request.getLocale()))
            throw new AccessDeniedException("Данный перевод уже создан");

        User requester = request.getRequester();
        Wiki wiki = request.getWiki();
        if(!requester.getRole().equals(EnumUserRole.ADMIN.name()) && requester.getId() != wiki.getUserId() && !this.staffService.isHaveStaff(wiki.getId(), requester.getId()))
            throw new AccessDeniedException("У вас нет прав");

        Translation translation = new Translation();
        translation.setTranslatableType(request.getType());
        translation.setTranslatableId(request.getId());
        translation.setLocale(request.getLocale());
        translation.setTitle(request.getTitle());
        translation.setBody(request.getBody());

        return this.translationRepository.save(translation);
    }

    public Translation update(Translation entity) {
        return this.translationRepository.save(entity);
    }
}
