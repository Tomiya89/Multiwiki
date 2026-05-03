package com.multiwiki.message.requests;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageFilterRequest {
    @Min(1)
    @Max(20)
    private int limit = 10;

    private Integer lastId;
}
