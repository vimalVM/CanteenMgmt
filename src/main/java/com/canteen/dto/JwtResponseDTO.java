package com.canteen.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JwtResponseDTO {

    private String token;
    private String role;
    private String name;
    private String userId;
    private String email;
}
