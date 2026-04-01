package com.multiwiki.Image;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.multiwiki.user.User;

import jakarta.annotation.PostConstruct;

@Service
public class ImageService {
    @Value("${upload.path}")
    private String uploadPath;

    @Autowired
    private ImageRepository imageRepository;

    @PostConstruct
    public void init(){
        try {
            Files.createDirectories(Paths.get(this.uploadPath));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create path");
        }
    }

    public Optional<Image> findById(int id){
        return this.imageRepository.findById(id);
    }

    public Optional<Image> findByFilename(String filename){
        return this.imageRepository.findByFilename(filename);
    }

    public Optional<Image> findByUrl(String url){
        return this.imageRepository.findByUrl(url);
    }

    public Image createAvatar(User user, MultipartFile file) throws IOException, IllegalArgumentException{
        return this._createImage(user, file, EnumTypeImage.AVATAR);
    }

    public Image createBackground(User user, MultipartFile file) throws IOException, IllegalArgumentException{
        return this._createImage(user, file, EnumTypeImage.BACKGROUND);
    }

    public Image createCard(User user, MultipartFile file) throws IOException, IllegalArgumentException{
        return this._createImage(user, file, EnumTypeImage.CARD);
    }

    public Image createImage(User user, MultipartFile file) throws IOException, IllegalArgumentException{
        return this._createImage(user, file, EnumTypeImage.IMAGE);
    }

    private Image _createImage(User user, MultipartFile file, EnumTypeImage type) throws IOException, IllegalArgumentException{
        if (file.isEmpty()) 
            throw new IllegalArgumentException("Cannot upload empty file");

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) 
            throw new IllegalArgumentException("Only image files are allowed. Received: " + contentType);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty())
            throw new IllegalArgumentException("Invalid file name");

        String fileExtension = getFileExtension(originalFilename);
        if (!isAllowedExtension(fileExtension)) {
            throw new IllegalArgumentException("File extension not allowed: " + fileExtension);
        }

        Image image = new Image();
        String filename = UUID.randomUUID().toString() + fileExtension;

        Path path = Paths.get(this.uploadPath).resolve(filename);

        Files.copy(file.getInputStream(),path, StandardCopyOption.REPLACE_EXISTING);
        image.setType(type.name());
        image.setFilename(filename);
        image.setUrl("uploads/" + filename);
        image.setFileSize(file.getSize());
        image.setUserId(user.getId());
        return this.imageRepository.save(image);
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) 
            return "";
        
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1)
            return "";
        
        return filename.substring(lastDotIndex).toLowerCase();
    }

    private boolean isAllowedExtension(String extension) {
        if (extension == null || extension.isEmpty()) 
            return false;

        List<String> allowedExtensions = Arrays.asList(
            ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg"
        );
        
        return allowedExtensions.contains(extension.toLowerCase());
    }

    public void deleteImage(int id){
        Optional<Image> opt_image = this.imageRepository.findById(id);

        if(opt_image.isEmpty())
            return;

        Image image = opt_image.get();

        try {
            Path file = Paths.get(this.uploadPath).resolve(image.getFilename());
            Files.deleteIfExists(file);
        } catch (Exception e) { }

        this.imageRepository.deleteById(id);
    }
}
