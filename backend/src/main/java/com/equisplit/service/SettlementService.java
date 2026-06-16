package com.equisplit.service;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;

public interface SettlementService {

    SettlementResponse createSettlement(
            Long groupId,
            CreateSettlementRequest request,
            String userEmail
    );
}