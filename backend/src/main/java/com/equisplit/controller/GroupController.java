package com.equisplit.controller;

import com.equisplit.dto.response.GroupSummaryResponse;
import java.util.List;
import com.equisplit.dto.response.GroupDetailsResponse;
import com.equisplit.dto.request.CreateGroupRequest;
import com.equisplit.dto.request.UpdateGroupRequest;
import com.equisplit.dto.response.GroupMemberResponse;
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

        @DeleteMapping("/{groupId}/members/{userId}")
        public ResponseEntity<Void> removeMember(
                @PathVariable Long groupId,
                @PathVariable Long userId,
                Authentication authentication) {

        groupService.removeMember(
                groupId,
                userId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
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

        @GetMapping("/{groupId}/members")
        public ResponseEntity<List<GroupMemberResponse>> getGroupMembers(
                @PathVariable Long groupId,
                Authentication authentication) {

        return ResponseEntity.ok(
                groupService.getGroupMembers(
                        groupId,
                        authentication.getName()
                )
        );
        }

        @DeleteMapping("/{groupId}")
        public ResponseEntity<Void> deleteGroup(
                @PathVariable Long groupId,
                Authentication authentication) {

        groupService.deleteGroup(
                groupId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
        }

        @PutMapping("/{groupId}")
        public ResponseEntity<GroupResponse> updateGroup(
                @PathVariable Long groupId,
                @RequestBody @Valid UpdateGroupRequest request,
                Authentication authentication) {

        return ResponseEntity.ok(
                groupService.updateGroup(
                        groupId,
                        request,
                        authentication.getName()
                )
        );
        }
}