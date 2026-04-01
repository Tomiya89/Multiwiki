package com.multiwiki.staff.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateStaffRequest {
    @NotBlank(message = "Role is required")
    private String role;
}
