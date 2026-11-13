package com.equisplit.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyExpenseResponse implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    private String month;

    private BigDecimal totalAmount;

}