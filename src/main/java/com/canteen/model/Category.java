package com.canteen.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "categories")
public class Category {

    @Id
    private String id;

    private String name;

    private String description;

    @Builder.Default
    private int displayOrder = 0;

    private String iconUrl;
}
