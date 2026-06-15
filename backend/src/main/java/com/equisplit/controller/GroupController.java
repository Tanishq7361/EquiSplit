package com.equisplit.controller;

import com.equisplit.dto.response.GroupSummaryResponse;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                groupService.createGroup(request, email)
        );
    }
    @GetMapping
    public ResponseEntity<List<GroupSummaryResponse>> getMyGroups(
            Authentication authentication) {

        return ResponseEntity.ok(
                groupService.getMyGroups(authentication.getName())
        );
    }
}