package com.equisplit.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryExpenseResponse implements java.io.Serializable {

    private static final long serialVersionUID = 1L;

    private String category;

    private BigDecimal amount;

}