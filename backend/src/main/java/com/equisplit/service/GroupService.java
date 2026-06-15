package com.equisplit.service;

import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.dto.response.GroupSummaryResponse;

import java.util.List;

public interface GroupService {

    GroupResponse createGroup(
            CreateGroupRequest request,
            String userEmail
    );

    List<GroupSummaryResponse> getMyGroups(String userEmail);
}