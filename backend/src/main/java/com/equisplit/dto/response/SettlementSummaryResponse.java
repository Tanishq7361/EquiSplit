package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SettlementSummaryResponse {

    private Long id;

    private String payerName;

    private String receiverName;

    private BigDecimal amount;
}