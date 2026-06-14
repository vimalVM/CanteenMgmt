package com.canteen.repository;

import com.canteen.model.MenuItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends MongoRepository<MenuItem, String> {
    List<MenuItem> findByCategory(String category);
    List<MenuItem> findByAvailable(boolean available);
    List<MenuItem> findByCategoryAndAvailable(String category, boolean available);
    List<MenuItem> findByNameContainingIgnoreCase(String name);
    List<MenuItem> findByIsVeg(boolean isVeg);
    List<MenuItem> findByIsDailySpecial(boolean isDailySpecial);
}
