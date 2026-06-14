package com.canteen.dto;

import com.canteen.model.PaymentMode;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequestDTO {

    private String specialInstructions;

    @NotNull(message = "Payment mode is required")
    private PaymentMode paymentMode;
}
