package com.mobicomm.app.repository;

import org.springframework.data.repository.CrudRepository;

import com.mobicomm.app.model.RevokedToken;


public interface RevokedRepository extends CrudRepository<RevokedToken, String>{

}
