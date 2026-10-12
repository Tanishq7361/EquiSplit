import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import groupsApi from '../../api/groupsApi';
import dashboardApi from '../../api/dashboardApi';
import expensesApi from '../../api/expensesApi';
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
  const [netBalance, setNetBalance] = useState(0);
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

      const groupList = groupsRes.data || [];
      setGroups(groupList);
      setDashboard(dashboardRes.data);
      setCategoryData(categoryRes.data || []);
      setMonthlyData(monthlyRes.data || []);

      // Calculate user balance across all groups
      if (groupList.length > 0) {
        try {
          const balanceResults = await Promise.all(
            groupList.map(g => expensesApi.getBalances(g.id).catch(() => ({ data: [] })))
          );
          let totalBal = 0;
          const myName = (user?.name || '').trim().toLowerCase();
          const myEmail = (user?.email || '').trim().toLowerCase();

          balanceResults.forEach(bRes => {
            const list = bRes.data || [];
            const userBal = list.find(item => {
              const itemUserName = (item.userName || '').trim().toLowerCase();
              return itemUserName === myName || itemUserName === myEmail;
            });
            if (userBal && userBal.balance != null) {
              totalBal += Number(userBal.balance);
            }
          });
          setNetBalance(totalBal);
        } catch (balErr) {
          console.warn('Failed to calculate overall group balance:', balErr);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.name, user?.email]);

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

  const formattedNetBalance = useMemo(() => {
    const isPositive = netBalance > 0.001;
    const isNegative = netBalance < -0.001;
    const absVal = Math.abs(netBalance);
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(absVal);

    if (isPositive) return `+${formatted}`;
    if (isNegative) return `-${formatted}`;
    return '₹0.00';
  }, [netBalance]);

  if (loading) {
    return (
      <div className={styles.page}>
        {/* Hero Skeleton */}
        <div className={styles.heroCard}>
          <div className={styles.heroCardInner}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', width: '100%' }}>
              <Skeleton circle width="120px" height="120px" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Skeleton width="240px" height="32px" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <Skeleton height="70px" borderRadius="10px" />
                  <Skeleton height="70px" borderRadius="10px" />
                  <Skeleton height="70px" borderRadius="10px" />
                </div>
              </div>
            </div>
          </div>
        </div>

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
      {/* ── Main Overview Box with Roaming Laser Border ── */}
      <div className={styles.heroCard}>
        <div className={styles.heroCardInner}>
          {/* Left Side: Huge PFP */}
          <div className={styles.heroLeft}>
            <div
              className={styles.heroAvatarWrapper}
              onClick={openProfile}
              role="button"
              tabIndex={0}
              title="Click to edit profile photo & details"
            >
              <Avatar
                name={user?.name || user?.email}
                src={user?.profileImageUrl}
                size="huge"
                className={styles.hugeAvatar}
              />
              <span className={styles.heroAvatarBadge}>
                <FiEdit3 size={15} />
              </span>
            </div>
          </div>

          {/* Right Side: Name, Current Balance (+/-), No of groups, No of expenses */}
          <div className={styles.heroRight}>
            <div className={styles.heroUserHeader}>
              <div>
                <div className={styles.greetingTag}>Account Overview</div>
                <h1 className={styles.userNameTitle}>{user?.name || 'My Account'}</h1>
                <p className={styles.userEmailText}>{user?.email}</p>
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

            {/* Metrics Strip */}
            <div className={styles.heroMetricsStrip}>
              {/* Current Balance over all groups */}
              <div
                className={`${styles.heroMetricCard} ${
                  netBalance > 0.001
                    ? styles.positiveBalance
                    : netBalance < -0.001
                    ? styles.negativeBalance
                    : styles.neutralBalance
                }`}
              >
                <div className={styles.metricLabelRow}>
                  <span className={styles.metricLabel}>Current Balance</span>
                  <span className={styles.balanceStatusPill}>
                    {netBalance > 0.001
                      ? '+ve (Owed)'
                      : netBalance < -0.001
                      ? '-ve (You Owe)'
                      : 'Settled'}
                  </span>
                </div>
                <div className={styles.metricBigValue}>{formattedNetBalance}</div>
                <span className={styles.metricSubtext}>Across all your groups</span>
              </div>

              {/* No of Groups */}
              <div className={styles.heroMetricCard}>
                <div className={styles.metricLabelRow}>
                  <span className={styles.metricLabel}>No. of Groups</span>
                  <div className={styles.metricIconCircle}>
                    <FiUsers size={15} />
                  </div>
                </div>
                <div className={styles.metricBigValue}>
                  {dashboard?.totalGroups ?? groups.length}
                </div>
                <span className={styles.metricSubtext}>Shared groups joined</span>
              </div>

              {/* No of Expenses */}
              <div className={styles.heroMetricCard}>
                <div className={styles.metricLabelRow}>
                  <span className={styles.metricLabel}>No. of Expenses</span>
                  <div className={styles.metricIconCircle}>
                    <FiFileText size={15} />
                  </div>
                </div>
                <div className={styles.metricBigValue}>
                  {dashboard?.totalExpenses ?? 0}
                </div>
                <span className={styles.metricSubtext}>Across all active groups</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="error" className={styles.alert}>{error}</Alert>}

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


