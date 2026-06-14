package com.canteen.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "menu_items")
public class MenuItem {

    @Id
    private String id;

    private String name;

    private String description;

    private double price;

    private String category;

    private String imageUrl;

    @Builder.Default
    private boolean available = true;

    private int preparationTime; // in minutes

    @Builder.Default
    private double rating = 0.0;

    @Builder.Default
    private int totalOrders = 0;

    @Builder.Default
    private boolean isVeg = true;

    private int calories;

    @Builder.Default
    private boolean isDailySpecial = false;

    @Builder.Default
    private int ratingCount = 0;
}
