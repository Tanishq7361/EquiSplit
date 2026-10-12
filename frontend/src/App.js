import React, { useState, useEffect } from 'react';
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
import EditGroupPage    from "./features/groups/EditGroupPage";

// Expenses
import CreateExpensePage from './features/expenses/CreateExpensePage';
import EditExpensePage from './features/expenses/EditExpensePage';

// Settlements
import CreateSettlementPage from './features/settlements/CreateSettlementPage';

import { ServerLoaderProvider } from "./context/ServerLoaderContext";
import SettingsPage from './features/profile/SettingsPage';
import EntranceSplashScreen from './components/common/EntranceSplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    window.triggerEquiSplitSplash = () => setShowSplash(true);
    return () => {
      delete window.triggerEquiSplitSplash;
    };
  }, []);

  return (
    <BrowserRouter>
      {showSplash && (
        <EntranceSplashScreen onComplete={() => setShowSplash(false)} duration={2200} />
      )}
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
              <Route path="/dashboard"                                element={<DashboardPage />} />
              <Route path="/groups"                                   element={<GroupsPage />} />
              <Route path="/groups/new"                               element={<CreateGroupPage />} />
              <Route path="/groups/:groupId"                          element={<GroupDetailPage />} />
              <Route path="/groups/:groupId/members/add"              element={<AddMemberPage />} />
              <Route path="/groups/:groupId/expenses/new"             element={<CreateExpensePage />} />
              <Route path="/groups/:groupId/settlements/new"          element={<CreateSettlementPage />} />
              <Route path="/groups/:groupId/expenses/:expenseId/edit" element={<EditExpensePage />} />
              <Route path="/groups/:groupId/edit"                     element={<EditGroupPage />} />
              <Route path="/settings"                                 element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ServerLoaderProvider> 
    </BrowserRouter>
  );
}
