package com.mobicomm.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mobicomm.app.model.Query;
import com.mobicomm.app.service.QueryService;

@RestController
@RequestMapping("/api/query")
public class QueryController {
	
	@Autowired
	private QueryService queryService;
	
	@GetMapping
	public ResponseEntity<?> showAllQueries() {
		List<Query> queries = queryService.getAllQueries();
		
		if (queries.isEmpty()) {
			return new ResponseEntity<>(HttpStatus.NO_CONTENT);
		} else {
			return new ResponseEntity<>(queries,HttpStatus.OK);
		}
	}
	
	@PostMapping
	public ResponseEntity<?> queryRaised(@RequestBody Query query) {
		queryService.queryRaised(query);
		return new ResponseEntity<>(HttpStatus.OK);
	}
}
