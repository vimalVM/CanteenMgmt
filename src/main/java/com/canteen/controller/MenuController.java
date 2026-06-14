package com.canteen.controller;

import com.canteen.model.Category;
import com.canteen.model.MenuItem;
import com.canteen.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MenuController {

    @Autowired
    private MenuService menuService;

    // ===== Menu Items =====

    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getAllItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Boolean isVeg) {

        List<MenuItem> items;
        if (category == null && search == null && available == null && isVeg == null) {
            items = menuService.getAllItems();
        } else {
            items = menuService.getFilteredItems(category, search, available, isVeg);
        }
        return ResponseEntity.ok(items);
    }

    @GetMapping("/menu/{id}")
    public ResponseEntity<?> getItemById(@PathVariable String id) {
        return menuService.getItemById(id)
                .map(item -> ResponseEntity.ok((Object) item))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/menu")
    public ResponseEntity<MenuItem> createItem(@Valid @RequestBody MenuItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createItem(item));
    }

    @PutMapping("/menu/{id}")
    public ResponseEntity<?> updateItem(@PathVariable String id, @Valid @RequestBody MenuItem item) {
        try {
            return ResponseEntity.ok(menuService.updateItem(id, item));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable String id) {
        menuService.deleteItem(id);
        return ResponseEntity.ok(Map.of("message", "Item deleted successfully"));
    }

    @PatchMapping("/menu/{id}/toggle")
    public ResponseEntity<?> toggleAvailability(@PathVariable String id) {
        try {
            return ResponseEntity.ok(menuService.toggleAvailability(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/menu/category/{categoryName}/toggle")
    public ResponseEntity<?> toggleCategoryAvailability(
            @PathVariable String categoryName,
            @RequestParam boolean available) {
        menuService.toggleCategoryAvailability(categoryName, available);
        return ResponseEntity.ok(Map.of("message", "Category availability updated"));
    }

    // ===== Categories =====

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@Valid @RequestBody Category category) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(menuService.createCategory(category));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @Valid @RequestBody Category category) {
        try {
            return ResponseEntity.ok(menuService.updateCategory(id, category));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        menuService.deleteCategory(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }
}
