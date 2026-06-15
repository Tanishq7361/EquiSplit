package com.equisplit.service;

import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;

public interface GroupService {

    GroupResponse createGroup(CreateGroupRequest request, String userEmail);
}