package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GroupSummaryResponse {

    private Long id;
    private String name;
    private String description;

    private Integer memberCount;
    private Integer totalExpenses;
}