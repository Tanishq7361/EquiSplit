package com.equisplit.service;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.dto.response.SettlementSummaryResponse;
import java.util.List;

public interface SettlementService {

    SettlementResponse createSettlement(
            Long groupId,
            CreateSettlementRequest request,
            String userEmail
    );

    List<SettlementSummaryResponse> getGroupSettlements(
        Long groupId,
        String userEmail
    );
}