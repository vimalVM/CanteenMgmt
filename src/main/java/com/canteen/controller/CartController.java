package com.canteen.controller;

import com.canteen.dto.CartItemDTO;
import com.canteen.model.Cart;
import com.canteen.model.User;
import com.canteen.service.CartService;
import com.canteen.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    private String getUserId(Authentication auth) {
        User user = userService.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication auth) {
        return ResponseEntity.ok(cartService.getCart(getUserId(auth)));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addItem(Authentication auth, @Valid @RequestBody CartItemDTO dto) {
        try {
            Cart cart = cartService.addItem(getUserId(auth), dto);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<?> updateQuantity(
            Authentication auth,
            @PathVariable String itemId,
            @RequestBody Map<String, Integer> body) {
        try {
            int quantity = body.getOrDefault("quantity", 1);
            Cart cart = cartService.updateItemQuantity(getUserId(auth), itemId, quantity);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{itemId}")
    public ResponseEntity<Cart> removeItem(Authentication auth, @PathVariable String itemId) {
        return ResponseEntity.ok(cartService.removeItem(getUserId(auth), itemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Cart> clearCart(Authentication auth) {
        return ResponseEntity.ok(cartService.clearCart(getUserId(auth)));
    }
}
