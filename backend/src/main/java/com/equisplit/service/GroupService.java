package com.equisplit.service;

import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.dto.response.GroupSummaryResponse;
import com.equisplit.dto.request.AddMemberRequest;
import java.util.List;

public interface GroupService {

    GroupResponse createGroup(
            CreateGroupRequest request,
            String userEmail
    );
    void addMember(Long groupId, AddMemberRequest request, String userEmail);
    List<GroupSummaryResponse> getMyGroups(String userEmail);
}