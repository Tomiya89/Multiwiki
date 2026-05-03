package com.multiwiki.like;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "likes")
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "attachmentType", nullable = false)
    private String attachmentType;
    
    @Column(name = "attachmentId", nullable = false)
    private int attachmentId;

    @Column(name = "userId", nullable = false)
    private int userId;

    @Column(name = "createdAt", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) 
            this.createdAt = LocalDateTime.now();
    }

    public void setAttachmentType(EnumLikeAttachmentType attachmentType){
        this.attachmentType = attachmentType.name();
    }    
}
