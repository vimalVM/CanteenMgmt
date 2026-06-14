package com.canteen.controller;

import com.canteen.model.User;
import com.canteen.service.OrderService;
import com.canteen.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class StudentController {

    @Autowired
    private UserService userService;

    @Autowired
    private OrderService orderService;

    // Admin: get all students
    @GetMapping("/api/students")
    public ResponseEntity<List<User>> getAllStudents(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok(userService.searchStudents(search));
        }
        return ResponseEntity.ok(userService.getAllStudents());
    }

    // Admin: get student by id
    @GetMapping("/api/students/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable String id) {
        return userService.findById(id)
                .map(user -> {
                    var orders = orderService.getStudentOrders(user.getId());
                    double totalSpent = orders.stream().mapToDouble(o -> o.getTotalAmount()).sum();
                    return ResponseEntity.ok(Map.of(
                            "user", user,
                            "orders", orders,
                            "totalOrders", orders.size(),
                            "totalSpent", totalSpent
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Student: update own profile
    @PutMapping("/api/profile")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody Map<String, String> updates) {
        try {
            User user = userService.updateProfile(auth.getName(), updates);
            return ResponseEntity.ok(Map.of(
                    "message", "Profile updated successfully",
                    "user", user
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Student: change password
    @PatchMapping("/api/profile/password")
    public ResponseEntity<?> changePassword(Authentication auth, @RequestBody Map<String, String> body) {
        try {
            String currentPassword = body.get("currentPassword");
            String newPassword = body.get("newPassword");
            userService.changePassword(auth.getName(), currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
