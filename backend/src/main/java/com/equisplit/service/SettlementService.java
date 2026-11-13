package com.equisplit.service;

import com.equisplit.dto.request.CreateSettlementRequest;
import com.equisplit.dto.response.SettlementResponse;
import com.equisplit.dto.response.SettlementSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface SettlementService {

    SettlementResponse createSettlement(
        Long groupId,
        CreateSettlementRequest request,
        String userEmail
    );

    List<SettlementSummaryResponse> getGroupSettlements(Long groupId, String userEmail);

    Page<SettlementSummaryResponse> getGroupSettlements(Long groupId, Pageable pageable, String userEmail);

    void deleteSettlement(
        Long groupId,
        Long settlementId,
        String userEmail
    );
}