package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class SettlementSummaryResponse {

    private Long id;
    private String payerName;
    private String receiverName;
    private BigDecimal amount;
    private OffsetDateTime createdAt;
    private String description;
}