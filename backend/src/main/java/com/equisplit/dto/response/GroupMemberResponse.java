package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GroupMemberResponse {

    private Long id;

    private String name;

    private String email;

    private String role;
}