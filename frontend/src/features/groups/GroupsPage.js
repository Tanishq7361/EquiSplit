import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import groupsApi from '../../api/groupsApi';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { AvatarGroup } from '../../components/common/Avatar';
import styles from './groups.module.css';

export default function GroupsPage() {
  const navigate = useNavigate();
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await groupsApi.getGroups();
      setGroups(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Groups</h1>
          <p className={styles.pageSubtitle}>Manage your expense groups</p>
        </div>
        <Button onClick={() => navigate('/groups/new')}>+ New Group</Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {groups.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No groups yet"
          description="Create a group to start splitting expenses."
          action={() => navigate('/groups/new')}
          actionLabel="Create group"
        />
      ) : (
        <div className={styles.list}>
          {groups.map((group) => (
            <Link key={group.id} to={`/groups/${group.id}`} className={styles.listItem}>
              <div className={styles.groupLeft}>
                  <div className={styles.groupAvatar}>
                      {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.listItemMain}>
                      <div className={styles.listItemName}>
                          {group.name}
                      </div>
                      {group.description && (
                          <div className={styles.listItemDesc}>
                            <div className={styles.groupStats}>
                                <span>
                                    👥 {group.memberCount}
                                </span>
                                <span>
                                    💸 {group.totalExpenses}
                                </span>
                            </div>
                              {group.description}
                          </div>
                      )}
                  </div>
              </div>
              <div className={styles.listItemRight}>
                <AvatarGroup
                  names={(group.members || []).map((m) => m.name || m.email)}
                  max={3}
                />
                <span className={styles.arrow}>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
