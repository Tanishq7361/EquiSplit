package com.equisplit.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GroupDetailsResponse {

    private Long id;
    private String name;
    private String description;
    private List<GroupMemberResponse> members;
}