package com.canteen.controller;

import com.canteen.dto.OrderRequestDTO;
import com.canteen.model.Order;
import com.canteen.model.OrderStatus;
import com.canteen.model.User;
import com.canteen.service.OrderService;
import com.canteen.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    private User getUser(Authentication auth) {
        return userService.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Student: place order
    @PostMapping
    public ResponseEntity<?> placeOrder(Authentication auth, @Valid @RequestBody OrderRequestDTO dto) {
        try {
            User user = getUser(auth);
            Order order = orderService.placeOrder(user.getId(), user.getName(), user.getEmail(), dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Student: my orders
    @GetMapping("/my")
    public ResponseEntity<List<Order>> getMyOrders(Authentication auth) {
        User user = getUser(auth);
        return ResponseEntity.ok(orderService.getStudentOrders(user.getId()));
    }

    // Student: my order detail
    @GetMapping("/my/{id}")
    public ResponseEntity<?> getMyOrderDetail(Authentication auth, @PathVariable String id) {
        User user = getUser(auth);
        return orderService.getOrderById(id)
                .filter(order -> order.getStudentId().equals(user.getId()))
                .map(order -> ResponseEntity.ok((Object) order))
                .orElse(ResponseEntity.notFound().build());
    }

    // Student: cancel order
    @PatchMapping("/my/{id}/cancel")
    public ResponseEntity<?> cancelOrder(Authentication auth, @PathVariable String id) {
        try {
            User user = getUser(auth);
            Order order = orderService.cancelOrder(id, user.getId());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Student: rate order
    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateOrder(
            Authentication auth,
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        try {
            User user = getUser(auth);
            int rating = (int) body.getOrDefault("rating", 5);
            String review = (String) body.getOrDefault("review", "");
            Order order = orderService.rateOrder(id, user.getId(), rating, review);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: all orders
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders(
            @RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                return ResponseEntity.ok(orderService.getOrdersByStatus(orderStatus));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.ok(orderService.getAllOrders());
            }
        }
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Admin: order detail
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id) {
        return orderService.getOrderById(id)
                .map(order -> ResponseEntity.ok((Object) order))
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin: update status
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        try {
            OrderStatus newStatus = OrderStatus.valueOf(body.get("status").toUpperCase());
            Order order = orderService.updateStatus(id, newStatus);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: today stats
    @GetMapping("/today/stats")
    public ResponseEntity<Map<String, Object>> getTodayStats() {
        return ResponseEntity.ok(orderService.getTodayStats());
    }
}
