package com.equisplit.controller;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
}