package com.canteen.repository;

import com.canteen.model.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findByName(String name);
    boolean existsByName(String name);
    List<Category> findAllByOrderByDisplayOrderAsc();
}
