package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class BalanceResponse {

    private String userName;

    private BigDecimal paid;

    private BigDecimal owes;

    private BigDecimal balance;
}