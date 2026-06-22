import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from "../../context/ThemeContext";
import { Avatar } from '../common/Avatar';
import styles from './AppLayout.module.css';
import { FiMoon, FiSun } from "react-icons/fi";
import { FaBalanceScale } from "react-icons/fa";
import { HiScale } from "react-icons/hi";
import { GiWeightScale } from "react-icons/gi";

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/groups',    label: 'Groups',    icon: '◈' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <NavLink to="/dashboard" className={styles.logo} onClick={closeSidebar}>
          <div className={styles.logoIcon}><FaBalanceScale size={16}/></div>
          <span className={styles.logoText}>Equi<span>Split</span></span>
        </NavLink>

        <nav className={styles.nav} aria-label="Main navigation">
          <span className={styles.navLabel}>Main</span>
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
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <Avatar name={user?.name || user?.email} size="sm" />
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || 'User'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            ↪ Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>

          <span className={styles.pageTitle}>
            EquiSplit
          </span>

          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <FiSun size={18}/>
              : <FiMoon size={18}/>
            }
          </button>

        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
