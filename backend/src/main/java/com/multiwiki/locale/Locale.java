package com.multiwiki.locale;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "locale")
public class Locale {    
    @Id
    @Column(name = "locale", length = 2, nullable = false)
    private String locale;

    @Column(name = "name", length = 32, nullable = false)
    private String name;
}
