package com.equisplit.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateSettlementRequest {

    @Email
    @NotNull
    private String receiverEmail;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal amount;
}