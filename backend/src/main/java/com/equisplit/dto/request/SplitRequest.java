package com.equisplit.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SplitRequest {

    private Long userId;

    private BigDecimal value;
}