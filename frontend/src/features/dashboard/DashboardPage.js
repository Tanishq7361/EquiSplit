import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import groupsApi from '../../api/groupsApi';
import dashboardApi from '../../api/dashboardApi';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { Avatar, AvatarGroup } from '../../components/common/Avatar';
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import MonthlyBarChart from "../../components/charts/MonthlyBarChart";
import UserProfileModal from '../../components/profile/UserProfileModal';
import Pagination from '../../components/common/Pagination';
import {
  StatCardSkeleton,
  GroupCardSkeleton,
  AnalyticsSkeleton,
  Skeleton
} from '../../components/common/Skeleton';
import styles from './Dashboard.module.css';

import {
  FiPlus,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiCheckCircle,
  FiArrowRight,
  FiSearch,
  FiEdit3,
  FiTrendingUp,
  FiLayers
} from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const outletContext = useOutletContext();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => {
    return parseInt(localStorage.getItem('dashboardGroupPageSize') || '10', 10);
  });


  const openProfile = () => {
    if (outletContext?.openProfileModal) {
      outletContext.openProfileModal();
    } else {
      setProfileModalOpen(true);
    }
  };

  const loadDashboardData = useCallback(async () => {
    try {
      const [
        groupsRes,
        dashboardRes,
        categoryRes,
        monthlyRes
      ] = await Promise.all([
        groupsApi.getGroups(),
        dashboardApi.getDashboard(),
        dashboardApi.getCategorySummary(),
        dashboardApi.getMonthlySummary()
      ]);

      setGroups(groupsRes.data || []);
      setDashboard(dashboardRes.data);
      setCategoryData(categoryRes.data || []);
      setMonthlyData(monthlyRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(g =>
      g.name?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q)
    );
  }, [groups, searchQuery]);

  const formattedTotalAmount = useMemo(() => {
    const raw = Number(dashboard?.totalExpenseAmount || 0);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(raw);
  }, [dashboard?.totalExpenseAmount]);

  if (loading) {

    return (
      <div className={styles.page}>
        {/* Hero Skeleton */}
        <div className={styles.heroCard}>
          <div className={styles.heroMain}>
            <Skeleton circle width="64px" height="64px" />
            <div className={styles.heroContent} style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                <Skeleton width="220px" height="26px" />
                <Skeleton width="90px" height="20px" borderRadius="100px" />
              </div>
              <Skeleton width="70%" height="14px" />
            </div>
          </div>
          <div className={styles.heroActions}>
            <Skeleton width="110px" height="38px" borderRadius="var(--radius-md)" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className={styles.statsGrid}>
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Analytics Skeleton */}
        <AnalyticsSkeleton />

        {/* Groups Grid Skeleton */}
        <div className={styles.groupsSection}>
          <div className={styles.sectionHeader}>
            <div>
              <Skeleton width="130px" height="22px" style={{ marginBottom: '6px' }} />
              <Skeleton width="180px" height="13px" />
            </div>
          </div>
          <div className={styles.groupGrid}>
            {[...Array(3)].map((_, i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className={styles.page}>
      {/* Hero / Welcome Banner */}
      <div className={styles.heroCard}>
        <div className={styles.heroMain}>
          <div
            className={styles.heroAvatarWrapper}
            onClick={openProfile}
            role="button"
            tabIndex={0}
            title="Click to edit your name & photo"
          >
            <Avatar
              name={user?.name || user?.email}
              src={user?.profileImageUrl}
              size="lg"
              className={styles.heroAvatar}
            />
            <span className={styles.heroAvatarBadge}>
              <FiEdit3 size={11} />
            </span>
          </div>

          <div className={styles.heroContent}>
            <div className={styles.greetingRow}>
              <h1 className={styles.greeting}>
                Welcome back, <span>{user?.name || 'there'}</span>
              </h1>
              <span className={styles.statusBadge}>Active Account</span>
            </div>
            <p className={styles.subtitle}>
              Manage shared balances, track group expenditures, and settle debts seamlessly.
            </p>
          </div>
        </div>

        <div className={styles.heroActions}>
          <button
            type="button"
            className={styles.editProfileBtn}
            onClick={openProfile}
          >
            <FiEdit3 size={14} />
            <span>Edit Profile</span>
          </button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/groups/new')}
          >
            <FiPlus size={16} />
            <span>New Group</span>
          </Button>
        </div>
      </div>

      {error && <Alert variant="error" className={styles.alert}>{error}</Alert>}

      {/* Stats / Metric Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Active Groups</span>
            <div className={`${styles.statIconBadge} ${styles.iconBlue}`}>
              <FiUsers size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{dashboard?.totalGroups ?? 0}</div>
          <div className={styles.statFooter}>
            <span>Shared groups joined</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Total Expenses</span>
            <div className={`${styles.statIconBadge} ${styles.iconEmerald}`}>
              <FiFileText size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{dashboard?.totalExpenses ?? 0}</div>
          <div className={styles.statFooter}>
            <span>Across all active groups</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Tracked Expenses</span>
            <div className={`${styles.statIconBadge} ${styles.iconAmber}`}>
              <FiDollarSign size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{formattedTotalAmount}</div>
          <div className={styles.statFooter}>
            <span>Cumulative group spend</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statTop}>
            <span className={styles.statLabel}>Settlements</span>
            <div className={`${styles.statIconBadge} ${styles.iconPurple}`}>
              <FiCheckCircle size={18} />
            </div>
          </div>
          <div className={styles.statValue}>{dashboard?.totalSettlements ?? 0}</div>
          <div className={styles.statFooter}>
            <span>Completed settlements</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      {(categoryData.length > 0 || monthlyData.length > 0) && (
        <div className={styles.analyticsSection}>
          <div className={styles.sectionTitleRow}>
            <div>
              <h2 className={styles.sectionTitle}>Spending Analytics</h2>
              <p className={styles.sectionSubtitle}>Visual insights across all shared expenses</p>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartWrapper}>
              <CategoryPieChart data={categoryData} />
            </div>
            <div className={styles.chartWrapper}>
              <MonthlyBarChart data={monthlyData} />
            </div>
          </div>
        </div>
      )}

      {/* Groups Section */}
      <div className={styles.groupsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Your Groups</h2>
            <p className={styles.sectionSubtitle}>
              {groups.length} {groups.length === 1 ? 'group' : 'groups'} available
            </p>
          </div>

          <div className={styles.groupHeaderActions}>
            {groups.length > 3 && (
              <div className={styles.searchBox}>
                <FiSearch size={14} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Filter groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
            )}

            <Button size="sm" variant="primary" onClick={() => navigate('/groups/new')}>
              <FiPlus size={15} />
              <span>Create Group</span>
            </Button>
          </div>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            icon="◈"
            title="No shared groups yet"
            description="Create your first group to start splitting bills, trips, rent, and outings with friends."
            action={() => navigate('/groups/new')}
            actionLabel="Create your first group"
          />
        ) : filteredGroups.length === 0 ? (
          <div className={styles.noMatch}>
            <p>No groups match "<strong>{searchQuery}</strong>"</p>
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setSearchQuery('')}
            >
              Clear filter
            </button>
          </div>
        ) : (
          <>
            <div className={styles.groupGrid}>
              {filteredGroups
                .slice((page - 1) * pageSize, page * pageSize)
                .map((group) => {
                  const memberList = group.members || [];
                  const memberNames = memberList.map(m => m.name || m.email);
                  const memberAvatars = memberList.map(m => m.profileImageUrl || '');
                  const memberCount = group.memberCount || memberList.length || 0;
                  const expenseCount = group.totalExpenses ?? 0;

                  return (
                    <Link
                      key={group.id}
                      to={`/groups/${group.id}`}
                      className={styles.groupCard}
                    >
                      <div className={styles.groupCardTop}>
                        <div className={styles.groupIconCircle}>
                          <FiLayers size={18} />
                        </div>
                        <span className={styles.groupOpenTag}>
                          Open <FiArrowRight size={12} />
                        </span>
                      </div>

                      <div className={styles.groupCardBody}>
                        <h3 className={styles.groupName}>{group.name}</h3>
                        <p className={styles.groupDesc}>
                          {group.description || 'No description provided'}
                        </p>
                      </div>

                      <div className={styles.groupCardBottom}>
                        <AvatarGroup
                          names={memberNames}
                          avatars={memberAvatars}
                          max={4}
                          size="sm"
                        />

                        <div className={styles.groupMetaBadges}>
                          <span className={styles.metaBadge}>
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                          </span>
                          <span className={styles.metaBadge}>
                            {expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>

            {filteredGroups.length > 10 && (
              <Pagination
                currentPage={page}
                pageSize={pageSize}
                totalItems={filteredGroups.length}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  localStorage.setItem('dashboardGroupPageSize', newSize);
                  setPage(1);
                }}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            )}
          </>
        )}
      </div>

      {/* Fallback Profile Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}


