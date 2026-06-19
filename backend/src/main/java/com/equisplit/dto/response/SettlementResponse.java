package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class SettlementResponse {

    private Long id;

    private String payerName;

    private String receiverName;
    private OffsetDateTime createdAt;
    private BigDecimal amount;
}