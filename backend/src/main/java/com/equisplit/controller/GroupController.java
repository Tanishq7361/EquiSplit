package com.equisplit.controller;

import com.equisplit.dto.response.GroupSummaryResponse;
import java.util.List;
import com.equisplit.dto.response.GroupDetailsResponse;
import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.response.GroupResponse;
import com.equisplit.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.equisplit.dto.request.AddMemberRequest;

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

    @PostMapping("/{groupId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable Long groupId,
            @Valid @RequestBody AddMemberRequest request,
            Authentication authentication) {

        groupService.addMember(
                groupId,
                request,
                authentication.getName()
        );

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupDetailsResponse> getGroupDetails(
            @PathVariable Long groupId,
            Authentication authentication) {

        return ResponseEntity.ok(
                groupService.getGroupDetails(
                        groupId,
                        authentication.getName()
                )
        );
    }
}