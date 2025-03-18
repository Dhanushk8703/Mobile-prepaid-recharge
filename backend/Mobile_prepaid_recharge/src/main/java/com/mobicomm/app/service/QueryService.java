package com.mobicomm.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.mobicomm.app.model.Query;
import com.mobicomm.app.repository.QueryRepository;

@Service
public class QueryService {
	
	@Autowired
	private QueryRepository queryRepository;
	
	public Query queryRaised(Query query) {
		return queryRepository.save(query);
	}
	
	public List<Query> getAllQueries() {
		return queryRepository.findAll();
	}

	public void deleteById(Long id) {
		queryRepository.deleteById(id);	
	}
}
