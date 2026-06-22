package com.equisplit.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyExpenseResponse {

    private String month;

    private BigDecimal totalAmount;

}