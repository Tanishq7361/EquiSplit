package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DebtResponse {

    private String fromUser;
    private String toUser;
    private BigDecimal amount;
}