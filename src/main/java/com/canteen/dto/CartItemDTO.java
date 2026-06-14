package com.canteen.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {

    @NotBlank(message = "Menu item ID is required")
    private String menuItemId;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
