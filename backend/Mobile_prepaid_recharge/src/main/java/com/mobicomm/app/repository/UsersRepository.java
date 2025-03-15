package com.mobicomm.app.repository;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.mobicomm.app.model.Users;

@Repository
public interface UsersRepository extends CrudRepository<Users, String>{

	Optional<Users> findByPhoneNumber(Long phoneNumber);

	Optional<Users> findTopByOrderByUserIdDesc();

}
