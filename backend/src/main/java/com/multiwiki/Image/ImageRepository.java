package com.multiwiki.Image;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends JpaRepository<Image, Integer>, JpaSpecificationExecutor<Image> {
    public Optional<Image> findByFilename(String filename);
    public Optional<Image> findByUrl(String url);

    public boolean existsByFilename(String filename);
    public boolean existsByUrl(String url);
}
