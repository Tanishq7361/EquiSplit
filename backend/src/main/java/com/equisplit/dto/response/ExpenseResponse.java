package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ExpenseResponse {

    private Long id;

    private BigDecimal amount;

    private String category;

    private String description;

    private String paidBy;
}