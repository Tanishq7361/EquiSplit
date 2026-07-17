package com.equisplit.service;

import com.equisplit.dto.response.DashboardResponse;
import com.equisplit.dto.response.CategoryExpenseResponse;
import java.util.List;

public interface DashboardService {

    DashboardResponse getDashboard(String userEmail);
    
    List<CategoryExpenseResponse> getOverallCategorySummary(String userEmail);
}