package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class ExpenseSummaryResponse {

    private Long id;
    private BigDecimal amount;
    private String category;
    private String description;
    private String paidBy;
    private Long paidById;
    private String splitType;
    private List<ExpenseSplitResponse> splits;
    private OffsetDateTime createdAt;
}