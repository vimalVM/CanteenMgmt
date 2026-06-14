package com.canteen.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    private String menuItemId;
    private String menuItemName;
    private int quantity;
    private double price;
    private String imageUrl;
    private boolean isVeg;
}
