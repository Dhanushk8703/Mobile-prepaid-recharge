package com.mobicomm.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.mobicomm.app.model.Query;

@Repository
public interface QueryRepository extends JpaRepository<Query, Long>{

}
