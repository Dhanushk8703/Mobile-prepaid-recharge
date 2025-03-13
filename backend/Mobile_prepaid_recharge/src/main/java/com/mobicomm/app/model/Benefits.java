package com.mobicomm.app.model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Benefits {
	@Id
	private String benefitsId;
	private String benefitsName;
	private String icon;
	
	@ManyToMany(mappedBy = "benefits", cascade = CascadeType.PERSIST)
	
	@JsonIgnore
    private List<Plan> plans;
}

