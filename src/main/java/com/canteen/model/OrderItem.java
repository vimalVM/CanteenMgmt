package com.canteen.model;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    private String menuItemId;
    private String menuItemName;
    private int quantity;
    private double price;
    private double subtotal;
    private boolean isVeg;
}
