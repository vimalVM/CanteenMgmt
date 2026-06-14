package com.canteen.service;

import com.canteen.model.Category;
import com.canteen.model.MenuItem;
import com.canteen.repository.CategoryRepository;
import com.canteen.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ===== Menu Items =====

    public List<MenuItem> getAllItems() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getFilteredItems(String category, String search, Boolean available, Boolean isVeg) {
        List<MenuItem> items = menuItemRepository.findAll();

        if (category != null && !category.isEmpty()) {
            items = items.stream()
                    .filter(item -> item.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }
        if (search != null && !search.isEmpty()) {
            String lowerSearch = search.toLowerCase();
            items = items.stream()
                    .filter(item -> item.getName().toLowerCase().contains(lowerSearch) ||
                                    item.getDescription().toLowerCase().contains(lowerSearch))
                    .collect(Collectors.toList());
        }
        if (available != null) {
            items = items.stream()
                    .filter(item -> item.isAvailable() == available)
                    .collect(Collectors.toList());
        }
        if (isVeg != null) {
            items = items.stream()
                    .filter(item -> item.isVeg() == isVeg)
                    .collect(Collectors.toList());
        }

        return items;
    }

    public Optional<MenuItem> getItemById(String id) {
        return menuItemRepository.findById(id);
    }

    public MenuItem createItem(MenuItem item) {
        return menuItemRepository.save(item);
    }

    public MenuItem updateItem(String id, MenuItem updatedItem) {
        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        existing.setName(updatedItem.getName());
        existing.setDescription(updatedItem.getDescription());
        existing.setPrice(updatedItem.getPrice());
        existing.setCategory(updatedItem.getCategory());
        existing.setImageUrl(updatedItem.getImageUrl());
        existing.setAvailable(updatedItem.isAvailable());
        existing.setPreparationTime(updatedItem.getPreparationTime());
        existing.setVeg(updatedItem.isVeg());
        existing.setCalories(updatedItem.getCalories());
        existing.setDailySpecial(updatedItem.isDailySpecial());

        return menuItemRepository.save(existing);
    }

    public void deleteItem(String id) {
        menuItemRepository.deleteById(id);
    }

    public MenuItem toggleAvailability(String id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setAvailable(!item.isAvailable());
        return menuItemRepository.save(item);
    }

    public void toggleCategoryAvailability(String categoryName, boolean available) {
        List<MenuItem> items = menuItemRepository.findByCategory(categoryName);
        items.forEach(item -> item.setAvailable(available));
        menuItemRepository.saveAll(items);
    }

    // ===== Categories =====

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc();
    }

    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category already exists");
        }
        return categoryRepository.save(category);
    }

    public Category updateCategory(String id, Category updatedCategory) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existing.setName(updatedCategory.getName());
        existing.setDescription(updatedCategory.getDescription());
        existing.setDisplayOrder(updatedCategory.getDisplayOrder());
        existing.setIconUrl(updatedCategory.getIconUrl());

        return categoryRepository.save(existing);
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }
}
