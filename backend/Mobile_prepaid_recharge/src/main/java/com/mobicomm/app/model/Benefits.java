package com.mobicomm.app.model;

import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "Benefits")
public class Benefits {
	@Id
	private String benefitsId;
	private String benefitsName;
	private String icon;
	
	@ManyToMany(mappedBy = "benefits")
    private Set<Plan> plans;
	
}
