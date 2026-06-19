package com.equisplit.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateExpenseRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotBlank
    private String category;

    private String description;

    @NotBlank
    private String splitType;

    @NotNull
    private Long paidBy;

    private List<SplitRequest> splits;
}