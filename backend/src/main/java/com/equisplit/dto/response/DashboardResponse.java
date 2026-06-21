package com.equisplit.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalGroups;

    private long totalExpenses;

    private long totalSettlements;

    private BigDecimal totalExpenseAmount;
}