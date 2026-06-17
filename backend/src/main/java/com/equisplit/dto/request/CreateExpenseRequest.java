package com.equisplit.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
public class CreateExpenseRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotBlank
    private String category;

    private String description;

    @NotBlank
    private String splitType;

    private List<SplitRequest> splits;
}