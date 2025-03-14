package com.mobicomm.app.model;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RevokedToken {
    @Id
    private String token;
    private Date revokedAt;

    public RevokedToken(String token) {
        this.token = token;
        this.revokedAt = new Date();
    }
}
