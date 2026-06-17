package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
@Builder
public class ExpenseSummaryResponse {

    private Long id;
    private BigDecimal amount;
    private String category;
    private String description;
    private String paidBy;
    private String splitType;
    private List<ExpenseSplitResponse> splits;
}