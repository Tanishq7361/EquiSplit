package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GroupResponse {

    private Long id;
    private String name;
    private String description;
}