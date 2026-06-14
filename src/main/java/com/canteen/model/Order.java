package com.canteen.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String studentEmail;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    private double totalAmount;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Builder.Default
    private PaymentMode paymentMode = PaymentMode.CASH;

    @Builder.Default
    private LocalDateTime orderTime = LocalDateTime.now();

    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;

    private String specialInstructions;

    private int tokenNumber;

    @Builder.Default
    private boolean isPaid = false;

    @Builder.Default
    private int rating = 0;

    private String review;
}
