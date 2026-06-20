import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import AuthLayout from './components/layout/AuthLayout';
import AppLayout  from './components/layout/AppLayout';

// Guards
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth
import LoginPage    from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';

// Dashboard
import DashboardPage from './features/dashboard/DashboardPage';

// Groups
import GroupsPage       from './features/groups/GroupsPage';
import CreateGroupPage  from './features/groups/CreateGroupPage';
import GroupDetailPage  from './features/groups/GroupDetailPage';
import AddMemberPage    from './features/groups/AddMemberPage';

// Expenses
import CreateExpensePage from './features/expenses/CreateExpensePage';

// Settlements
import CreateSettlementPage from './features/settlements/CreateSettlementPage';

import { ServerLoaderProvider } from "./context/ServerLoaderContext";

import EditExpensePage from './features/expenses/EditExpensePage';
export default function App() {
  return (
    <BrowserRouter>
      <ServerLoaderProvider>
        <AuthProvider>
          <Routes>
            {/* Public – auth */}
            <Route element={<AuthLayout />}>
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected – app */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard"                                    element={<DashboardPage />} />
              <Route path="/groups"                                       element={<GroupsPage />} />
              <Route path="/groups/new"                                   element={<CreateGroupPage />} />
              <Route path="/groups/:groupId"                              element={<GroupDetailPage />} />
              <Route path="/groups/:groupId/members/add"                  element={<AddMemberPage />} />
              <Route path="/groups/:groupId/expenses/new"                 element={<CreateExpensePage />} />
              <Route path="/groups/:groupId/settlements/new"              element={<CreateSettlementPage />} />
              <Route path="/groups/:groupId/expenses/:expenseId/edit"     element={<EditExpensePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ServerLoaderProvider> 
    </BrowserRouter>
  );
}
