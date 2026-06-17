package com.equisplit.controller;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.equisplit.dto.response.SettlementSummaryResponse;
import java.util.List;

@RestController
@RequestMapping("/api/v1/groups/{groupId}/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping
    public ResponseEntity<SettlementResponse> createSettlement(
            @PathVariable Long groupId,
            @Valid @RequestBody CreateSettlementRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                settlementService.createSettlement(
                        groupId,
                        request,
                        authentication.getName()
                )
        );
    }

    @GetMapping
        public ResponseEntity<List<SettlementSummaryResponse>> getGroupSettlements(
                @PathVariable Long groupId,
                Authentication authentication) {

        return ResponseEntity.ok(
                settlementService.getGroupSettlements(
                        groupId,
                        authentication.getName()
                )
        );
        }

        @DeleteMapping("/{settlementId}")
        public ResponseEntity<Void> deleteSettlement(
                @PathVariable Long groupId,
                @PathVariable Long settlementId,
                Authentication authentication) {

        settlementService.deleteSettlement(
                groupId,
                settlementId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
        }
}