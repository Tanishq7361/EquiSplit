package com.equisplit.service;

import com.equisplit.dto.response.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboard(String userEmail);

}