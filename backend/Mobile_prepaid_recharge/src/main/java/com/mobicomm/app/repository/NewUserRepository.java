package com.mobicomm.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mobicomm.app.model.NewUserRequest;

@Repository
public interface NewUserRepository extends JpaRepository<NewUserRequest, Long>{

}
