package com.equisplit.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateSettlementRequest {

    @NotNull
    private Long receiverId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;
}