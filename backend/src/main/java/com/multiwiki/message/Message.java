package com.multiwiki.message;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.multiwiki.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "parentId")
    private int parentId;

    @Column(name = "attachableType", nullable = false)
    private String attachableType;

    @Column(name = "attachableId", nullable = false)
    private int attachableId;

    @Column(name = "body", nullable = false)
    private String body;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "userId")
    private User user;

    @Column(name = "likesCount", nullable = false)
    private int likesCount;

    @Column(name = "createdAt", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    // @Column(name = "updatedAt")
    // @Temporal(TemporalType.TIMESTAMP)
    // private LocalDateTime updatedAt;    

    @Column(name = "status", nullable = false)
    private String status;

    @Transient
    private boolean isLiked;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) 
            this.createdAt = LocalDateTime.now();
        // if (this.updatedAt == null) 
        //     this.updatedAt = LocalDateTime.now();
        this.likesCount = 0;
        this.status = EnumMessageStatus.ACTIVE.name();
        this.isLiked = false;
    }

    public void setStatus(EnumMessageStatus status){
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
    
    @JsonIgnore
    public boolean isDeleted(){
        return this.status.equals(EnumMessageStatus.DELETED.name());
    }

    // @PreUpdate
    // protected void onUpdate() {
    //     this.updatedAt = LocalDateTime.now();
    // }
}
