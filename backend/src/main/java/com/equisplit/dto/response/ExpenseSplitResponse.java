package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ExpenseSplitResponse {

    private String userName;
    private BigDecimal shareAmount;
}