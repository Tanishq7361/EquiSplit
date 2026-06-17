import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import groupsApi from '../../api/groupsApi';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { AvatarGroup } from '../../components/common/Avatar';
import styles from './Dashboard.module.css';
import dashboardApi from '../../api/dashboardApi';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [outstandingBalance, setOutstandingBalance] = useState(0);

  const loadGroups = useCallback(async () => {
    try {
      const [groupsRes, balanceRes] = await Promise.all([
          groupsApi.getGroups(),
          dashboardApi.getOutstandingBalance()
      ]);

      setGroups(groupsRes.data || []);
      setOutstandingBalance(balanceRes.data || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGroups(); }, [loadGroups]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) return <PageLoader />;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.greeting}>
          Hey, <span>{firstName}</span> 👋
        </h1>
        <p className={styles.subtitle}>Here's what's happening across your groups.</p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard} style={{ '--accent-color': 'var(--color-accent)' }}>
          <span className={styles.statIcon}>◈</span>
          <span className={styles.statValue}>{groups.length}</span>
          <span className={styles.statLabel}>Total Groups</span>
        </div>
        <div className={styles.statCard} style={{ '--accent-color': 'var(--color-success)' }}>
          <span className={styles.statIcon}>$</span>
          <span className={styles.statValue}>
            {groups.reduce((sum, g) => sum + (g.totalExpenses || 0), 0)}
          </span>
          <span className={styles.statLabel}>Total Expenses</span>
        </div>
        <div className={styles.statCard} style={{ '--accent-color': 'var(--color-gold)' }}>
          <span className={styles.statIcon}>↔</span>
          <span className={styles.statValue}>
            {outstandingBalance}
          </span>
          <span className={styles.statLabel}>Net Balance</span>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Groups section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Groups</h2>
          <Button size="sm" onClick={() => navigate('/groups/new')}>
            + New Group
          </Button>
        </div>

        {groups.length === 0 ? (
          <EmptyState
            icon="◈"
            title="No groups yet"
            description="Create your first group to start splitting expenses with friends, family, or colleagues."
            action={() => navigate('/groups/new')}
            actionLabel="Create a group"
          />
        ) : (
          <div className={styles.groupGrid}>
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className={styles.groupCard}
              >
                <div className={styles.groupCardHeader}>
                  <div>
                    <div className={styles.groupName}>{group.name}</div>
                    {group.description && (
                      <div className={styles.groupDesc}>{group.description}</div>
                    )}
                  </div>
                </div>
                <AvatarGroup
                  names={(group.members || []).map((m) => m.name || m.email)}
                  max={4}
                />
                <div className={styles.groupMeta}>
                  <span className={styles.groupMetaItem}>
                    👤 {group.memberCount || (group.members?.length ?? 0)} members
                  </span>
                  <span className={styles.groupMetaItem}>
                    # {group.totalExpenses || 0} expenses
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
