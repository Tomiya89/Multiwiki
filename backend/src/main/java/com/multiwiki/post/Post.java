package com.multiwiki.post;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.multiwiki.user.User;
import com.multiwiki.wiki.Wiki;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "posts", indexes = {
    @Index(name = "posts_wikiId", columnList = "wikiId")
})
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "wikiId", nullable = false)
    private Wiki wiki;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "body", nullable = false)
    private String body;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(name = "likesCount", nullable = false)
    private int likesCount;

    @Column(name = "createdAt", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Column(name = "updatedAt")
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;    

    @Column(name = "status", nullable = false)
    private String status;

    @Transient
    private boolean isLiked;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) 
            this.createdAt = LocalDateTime.now();
        if (this.updatedAt == null) 
            this.updatedAt = LocalDateTime.now();
        this.likesCount = 0;
        this.status = EnumPostStatus.ACTIVE.name();
        this.isLiked = false;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void setStatus(EnumPostStatus status){
        this.status = status.name();
    }

    public void like(){
        this.likesCount++;
    }

    public void unlike(){
        this.likesCount--;
        if(this.likesCount < 0)
            this.likesCount = 0;
    }

    public boolean getIsLiked(){
        return this.isLiked;
    }

    @JsonIgnore
    public boolean isDeleted(){
        return this.status.equals(EnumPostStatus.DELETED.name());
    }
}
