package com.canteen.service;

import com.canteen.dto.CartItemDTO;
import com.canteen.model.Cart;
import com.canteen.model.CartItem;
import com.canteen.model.MenuItem;
import com.canteen.repository.CartRepository;
import com.canteen.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    public Cart getCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElse(Cart.builder()
                        .userId(userId)
                        .items(new ArrayList<>())
                        .updatedAt(LocalDateTime.now())
                        .build());
    }

    public Cart addItem(String userId, CartItemDTO dto) {
        MenuItem menuItem = menuItemRepository.findById(dto.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!menuItem.isAvailable()) {
            throw new RuntimeException("Menu item is not available");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElse(Cart.builder()
                        .userId(userId)
                        .items(new ArrayList<>())
                        .build());

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(ci -> ci.getMenuItemId().equals(dto.getMenuItemId()))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + dto.getQuantity());
        } else {
            CartItem cartItem = CartItem.builder()
                    .menuItemId(menuItem.getId())
                    .menuItemName(menuItem.getName())
                    .quantity(dto.getQuantity())
                    .price(menuItem.getPrice())
                    .imageUrl(menuItem.getImageUrl())
                    .isVeg(menuItem.isVeg())
                    .build();
            cart.getItems().add(cartItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(String userId, String menuItemId, int quantity) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getMenuItemId().equals(menuItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not in cart"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart removeItem(String userId, String menuItemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().removeIf(ci -> ci.getMenuItemId().equals(menuItemId));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart clearCart(String userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElse(Cart.builder()
                        .userId(userId)
                        .items(new ArrayList<>())
                        .build());

        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }
}
