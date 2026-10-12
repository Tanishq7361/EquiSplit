import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from "../../context/ThemeContext";
import { Avatar } from '../common/Avatar';
import UserProfileModal from '../profile/UserProfileModal';
import EquiSplit3DLogo from '../common/EquiSplit3DLogo';
import styles from './AppLayout.module.css';
import { FiMoon, FiSun, FiUser, FiLogOut, FiGrid, FiUsers, FiEdit3 } from "react-icons/fi";

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/groups',    label: 'Groups',    icon: <FiUsers /> },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const getPageTitle = () => {
    if (location.pathname.startsWith('/groups/new')) return 'Create New Group';
    if (location.pathname.startsWith('/groups/')) return 'Group Workspace';
    if (location.pathname === '/groups') return 'All Groups';
    if (location.pathname === '/settings') return 'Account Settings';
    return 'Dashboard';
  };

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <NavLink to="/dashboard" className={styles.logo} onClick={closeSidebar}>
          <EquiSplit3DLogo size="sm" animated={true} interactive={true} glow={true} />
          <span className={styles.logoText}>Equi<span>Split</span></span>
        </NavLink>

        <nav className={styles.nav} aria-label="Main navigation">
          <span className={styles.navLabel}>Menu</span>
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              onClick={closeSidebar}
            >
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navItemLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer with interactive user card */}
        <div className={styles.sidebarFooter}>
          <div
            className={styles.userCard}
            onClick={() => setProfileModalOpen(true)}
            role="button"
            tabIndex={0}
            title="Click to edit profile & photo"
          >
            <Avatar
              name={user?.name || user?.email}
              src={user?.profileImageUrl}
              size="md"
              className={styles.sidebarAvatar}
            />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || 'My Account'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
            <button
              type="button"
              className={styles.editProfileIconBtn}
              onClick={(e) => {
                e.stopPropagation();
                setProfileModalOpen(true);
              }}
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              <FiEdit3 size={14} />
            </button>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FiLogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              className={styles.menuBtn}
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <span className={styles.pageTitle}>{getPageTitle()}</span>
          </div>

          <div className={styles.topbarRight}>
            {/* Theme toggle */}
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
            </button>

            {/* Quick In-Dashboard Profile Button */}
            <button
              className={styles.userProfilePill}
              onClick={() => setProfileModalOpen(true)}
              title="Manage profile & photo"
            >
              <Avatar
                name={user?.name || user?.email}
                src={user?.profileImageUrl}
                size="sm"
              />
              <span className={styles.pillName}>
                {user?.name ? user.name.split(' ')[0] : 'Profile'}
              </span>
              <FiEdit3 size={12} className={styles.pillEditIcon} />
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet context={{ openProfileModal: () => setProfileModalOpen(true) }} />
        </main>
      </div>

      {/* Integrated In-Dashboard Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

