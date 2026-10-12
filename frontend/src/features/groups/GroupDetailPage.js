import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import groupsApi from '../../api/groupsApi';
import expensesApi from '../../api/expensesApi';
import settlementsApi from '../../api/settlementsApi';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import styles from './groups.module.css';
import CategoryPieChart from "../../components/charts/CategoryPieChart";
import Pagination from '../../components/common/Pagination';
import ExpenseFilterBar from '../expenses/ExpenseFilterBar';
import {
  ExpenseRowSkeleton,
  SettlementRowSkeleton,
  MemberRowSkeleton,
  DebtItemSkeleton,
  AnalyticsSkeleton,
  Skeleton
} from '../../components/common/Skeleton';

const TABS = [
  {
    label: "Expenses",
    icon: "📋"
  },
  {
    label: "Debts",
    icon: "💸"
  },
  {
    label: "Settlements",
    icon: "🤝"
  },
  {
    label: "Members",
    icon: "👥"
  }
];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Expenses');
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [debts, setDebts] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [datePreset, setDatePreset] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('all');

  // Pagination states
  const [expensesPage, setExpensesPage] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 });
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(() => {
    return parseInt(localStorage.getItem('expensePageSize') || '10', 10);
  });

  // Action loading states
  const [deletingGroupId, setDeletingGroupId] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load group metadata
  const loadGroupMetaData = useCallback(async () => {
    try {
      const [gRes, mRes, bRes, dRes, sRes, cRes] = await Promise.all([
        groupsApi.getGroup(groupId),
        groupsApi.getMembers(groupId),
        expensesApi.getBalances(groupId),
        expensesApi.getDebts(groupId),
        settlementsApi.getSettlements(groupId),
        expensesApi.getCategorySummary(groupId),
      ]);
      setGroup(gRes.data);
      setMembers(mRes.data || []);
      setBalances(bRes.data || []);
      setDebts(dRes.data || []);
      setSettlements(sRes.data || []);
      setCategoryData(cRes.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [groupId]);

  // Load paginated search expenses
  const loadExpenses = useCallback(async () => {
    try {
      setExpensesLoading(true);
      const res = await expensesApi.getExpenses(groupId, page, size, debouncedSearch);
      const rawData = res.data;
      const content = Array.isArray(rawData) ? rawData : (rawData?.content || []);
      const total = Array.isArray(rawData) ? rawData.length : (rawData?.totalElements ?? content.length);
      const totalPages = Array.isArray(rawData)
        ? Math.max(1, Math.ceil(rawData.length / size))
        : (rawData?.totalPages ?? 1);

      setExpensesPage({
        content,
        totalElements: total,
        totalPages,
        number: rawData?.number ?? page,
        size: rawData?.size ?? size,
      });
      setExpenses(content);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setExpensesLoading(false);
    }
  }, [groupId, page, size, debouncedSearch]);


  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadGroupMetaData();
      setLoading(false);
    };
    init();
  }, [loadGroupMetaData]);

  // Sync expenses on pagination/search change
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Reset page when local filters change
  useEffect(() => {
    setPage(0);
  }, [datePreset, customStartDate, customEndDate, selectedPerson]);

  // Clear all filters
  const handleClearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setSelectedPerson('all');
    setPage(0);
  };

  const isFiltered = Boolean(
    search.trim() ||
    datePreset !== 'all' ||
    customStartDate ||
    customEndDate ||
    selectedPerson !== 'all'
  );

  // Apply in-memory multi-condition filter to current loaded expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // 1. Date filter condition
      if (datePreset !== 'all' && exp.createdAt) {
        const expDate = new Date(exp.createdAt);
        const now = new Date();

        if (datePreset === 'today') {
          if (expDate.toDateString() !== now.toDateString()) return false;
        } else if (datePreset === 'this_week') {
          const startOfWeek = new Date(now);
          const day = startOfWeek.getDay();
          const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
          startOfWeek.setDate(diff);
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          if (expDate < startOfWeek || expDate > endOfWeek) return false;
        } else if (datePreset === 'this_month') {
          if (
            expDate.getMonth() !== now.getMonth() ||
            expDate.getFullYear() !== now.getFullYear()
          ) {
            return false;
          }
        } else if (datePreset === 'custom') {
          if (customStartDate) {
            const start = new Date(customStartDate);
            start.setHours(0, 0, 0, 0);
            if (expDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (expDate > end) return false;
          }
        }
      }

      // 2. Person filter condition (Payer or involved in split)
      if (selectedPerson !== 'all') {
        const isPayer = exp.paidByName === selectedPerson || exp.paidBy === selectedPerson;
        const isInSplits = (exp.splits || []).some(
          s => s.userName === selectedPerson || s.userId === selectedPerson
        );
        if (!isPayer && !isInSplits) return false;
      }

      // 3. Client search refinement if any
      if (debouncedSearch && debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const desc = (exp.description || '').toLowerCase();
        const cat = (exp.category || '').toLowerCase();
        const payer = (exp.paidByName || exp.paidBy || '').toLowerCase();
        const splitUsers = (exp.splits || []).map(s => (s.userName || '').toLowerCase()).join(' ');
        if (!desc.includes(q) && !cat.includes(q) && !payer.includes(q) && !splitUsers.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, datePreset, customStartDate, customEndDate, selectedPerson, debouncedSearch]);

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm("Delete this group permanently?");
    if (!confirmed) return;

    try {
      setDeletingGroupId(true);
      await groupsApi.deleteGroup(groupId);
      navigate("/groups");
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingGroupId(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    const confirmed = window.confirm("Delete this expense?");
    if (!confirmed) return;

    try {
      setDeletingExpenseId(expenseId);
      await expensesApi.deleteExpense(groupId, expenseId);
      loadExpenses();
      loadGroupMetaData();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingExpenseId(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <Skeleton width="100px" height="14px" style={{ marginBottom: '8px' }} />
            <Skeleton width="220px" height="28px" style={{ marginBottom: '6px' }} />
            <Skeleton width="180px" height="14px" />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Skeleton width="90px" height="36px" borderRadius="var(--radius-md)" />
            <Skeleton width="110px" height="36px" borderRadius="var(--radius-md)" />
          </div>
        </div>

        <AnalyticsSkeleton />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width="100px" height="36px" borderRadius="var(--radius-md)" />
          ))}
        </div>

        {[...Array(4)].map((_, i) => (
          <ExpenseRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) return <Alert variant="error">{error}</Alert>;
  if (!group) return null;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <button className={styles.backBtn} onClick={() => navigate('/groups')}>
            ← Back to Groups
          </button>
          <h1 className={styles.pageTitle}>{group.name}</h1>
          {group.description && (
            <p className={styles.pageSubtitle}>{group.description}</p>
          )}
        </div>
        <div className={styles.headerActions}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/groups/${groupId}/settlements/new`)}
          >
            Settle Up
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/groups/${groupId}/expenses/new`)}
          >
            + Add Expense
          </Button>
        </div>
      </div>

      <div className={styles.categoryWise}>
        <CategoryPieChart data={categoryData} />
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map(({ label, icon }) => (
          <button
            key={label}
            role="tab"
            aria-selected={activeTab === label}
            className={`${styles.tab} ${activeTab === label ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(label)}
          >
            <span>{icon}</span>
            {label}
            {label === 'Expenses' && expensesPage.totalElements > 0 && (
              <span className={styles.tabBadge}>{expensesPage.totalElements}</span>
            )}
            {label === 'Members' && members.length > 0 && (
              <span className={styles.tabBadge}>{members.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab contents */}
      {activeTab === 'Expenses' && (
        <ExpensesList
          expenses={filteredExpenses}
          groupId={groupId}
          navigate={navigate}
          onDeleteExpense={handleDeleteExpense}
          deletingExpenseId={deletingExpenseId}
          loading={expensesLoading}
          page={page}
          setPage={setPage}
          size={size}
          setSize={setSize}
          search={search}
          setSearch={setSearch}
          datePreset={datePreset}
          setDatePreset={setDatePreset}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          selectedPerson={selectedPerson}
          setSelectedPerson={setSelectedPerson}
          members={members}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
          totalElements={expensesPage.totalElements}
        />
      )}
      {activeTab === 'Debts' && (
        <DebtsList debts={debts} />
      )}
      {activeTab === 'Settlements' && (
        <SettlementsList settlements={settlements} groupId={groupId} navigate={navigate} />
      )}
      {activeTab === 'Members' && (
        <MembersList
          members={members}
          balances={balances}
          groupId={groupId}
          navigate={navigate}
          handleDeleteGroup={handleDeleteGroup}
          deletingGroupId={deletingGroupId}
        />
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function ExpensesList({
  expenses,
  groupId,
  navigate,
  onDeleteExpense,
  deletingExpenseId,
  loading,
  page,
  setPage,
  size,
  setSize,
  search,
  setSearch,
  datePreset,
  setDatePreset,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  selectedPerson,
  setSelectedPerson,
  members,
  onClearFilters,
  isFiltered,
  totalElements
}) {
  const [expandedExpense, setExpandedExpense] = useState(null);

  // Render contextual empty state
  const renderEmptyState = () => {
    if (!isFiltered) {
      return (
        <EmptyState
          icon="💸"
          title="No expenses yet"
          description="Add your first expense to get started."
          action={() => navigate(`/groups/${groupId}/expenses/new`)}
          actionLabel="Add expense"
        />
      );
    }

    if (search.trim() && datePreset === 'all' && selectedPerson === 'all') {
      return (
        <EmptyState
          icon="🔍"
          title="No expenses match your search"
          description="Try a different search term or clear your search."
          action={onClearFilters}
          actionLabel="Clear search"
        />
      );
    }

    return (
      <EmptyState
        icon="🎯"
        title="No expenses found for the selected filters"
        description="Try adjusting your date range, member filter, or clearing filters."
        action={onClearFilters}
        actionLabel="Clear Filters"
      />
    );
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <ExpenseFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        customStartDate={customStartDate}
        onCustomStartDateChange={setCustomStartDate}
        customEndDate={customEndDate}
        onCustomEndDateChange={setCustomEndDate}
        selectedPerson={selectedPerson}
        onSelectedPersonChange={setSelectedPerson}
        members={members}
        onClearFilters={onClearFilters}
        isFiltered={isFiltered}
      />

      {loading ? (
        <div className={styles.list}>
          {[...Array(4)].map((_, i) => (
            <ExpenseRowSkeleton key={i} />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div style={{ padding: '2rem 0' }}>
          {renderEmptyState()}
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {expenses.map((exp) => {
              const isDeleting = deletingExpenseId === exp.id;
              return (
                <div
                  key={exp.id}
                  className={styles.expenseItem}
                  onClick={() =>
                    setExpandedExpense(
                      expandedExpense === exp.id ? null : exp.id
                    )
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.expenseIcon}>💸</div>
                  <div className={styles.expenseInfo}>
                    <div className={styles.expenseName}>
                      {exp.description}
                      {' '}
                      <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                        {expandedExpense === exp.id ? '▲' : '▼'}
                      </span>
                    </div>
                    <div className={styles.expenseMeta}>
                      Paid by <strong>{exp.paidByName || exp.paidBy}</strong>
                    </div>

                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-muted)",
                        marginTop: "4px"
                      }}
                    >
                      {formatDateTime(exp.createdAt)}
                    </div>

                    {expandedExpense === exp.id && (
                      <div
                        style={{
                          marginTop: "10px",
                          fontSize: "0.85rem",
                          color: "var(--color-text-secondary)",
                          background: "var(--color-surface-2)",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-border)"
                        }}
                      >
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Category:</strong> {exp.category}
                        </div>

                        <div style={{ marginBottom: '6px' }}>
                          <strong>Split Type:</strong> {exp.splitType}
                        </div>

                        <div style={{ marginTop: '8px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          Split Details:
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                          {exp.splits?.map((split, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>{split.userName}</span>
                              <span style={{ fontWeight: 600 }}>{formatCurrency(split.shareAmount)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className={styles.expenseAmount}>
                      {formatCurrency(exp.amount)}
                    </div>

                    <button
                      className={styles.editBtn}
                      title="Edit expense"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/groups/${groupId}/expenses/${exp.id}/edit`);
                      }}
                    >
                      ✏️
                    </button>

                    <Button
                      variant="danger"
                      size="sm"
                      loading={isDeleting}
                      loadingText="Removing..."
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExpense(exp.id);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unified Dynamic Pagination Controls */}
          <Pagination
            currentPage={page + 1}
            pageSize={size}
            totalItems={totalElements}
            onPageChange={(newPage) => setPage(newPage - 1)}
            onPageSizeChange={(newSize) => {
              setSize(newSize);
              localStorage.setItem('expensePageSize', newSize);
              setPage(0);
            }}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </>
      )}
    </div>
  );
}

function DebtsList({ debts }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (!debts.length) {
    return (
      <EmptyState
        icon="✅"
        title="No debts"
        description="Everyone is settled up."
      />
    );
  }

  const paginatedDebts = debts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }}>
      {paginatedDebts.map((debt, index) => (
        <div
          key={index}
          className={styles.balanceItem}
        >
          <div className={styles.balanceInfo}>
            <strong>{debt.fromUser}</strong> {" → "} <strong>{debt.toUser}</strong>
          </div>
          <div className={styles.pending}>
            ⚠️ {formatCurrency(debt.amount)}
          </div>
        </div>
      ))}

      {debts.length > 10 && (
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={debts.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}

function SettlementsList({ settlements, groupId, navigate }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (settlementId) => {
    const confirmed = window.confirm("Delete this settlement?");
    if (!confirmed) return;

    try {
      setDeletingId(settlementId);
      await settlementsApi.deleteSettlement(groupId, settlementId);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!settlements.length) {
    return (
      <EmptyState
        icon="↔"
        title="No settlements yet"
        description="Record a payment between members."
        action={() => navigate(`/groups/${groupId}/settlements/new`)}
        actionLabel="Record settlement"
      />
    );
  }

  const paginatedSettlements = settlements.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className={styles.list}>
        {paginatedSettlements.map((s) => {
          const isDeleting = deletingId === s.id;
          return (
            <div key={s.id} className={styles.settlementItem}>
              <div className={styles.settlementIcon}>✓</div>
              <div className={styles.settlementInfo}>
                <div className={styles.settlementText}>
                  <strong>{s.payerName}</strong>{" → "}<strong>{s.receiverName}</strong>
                </div>
                {s.description && (
                  <div
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "0.9rem",
                      marginTop: "4px"
                    }}
                  >
                    {s.description}
                  </div>
                )}
                <div className={styles.settlementDate}>{formatDateTime(s.createdAt)}</div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}
              >
                <div className={styles.settlementAmount}>
                  {formatCurrency(s.amount)}
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  loading={isDeleting}
                  loadingText="Removing..."
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(s.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {settlements.length > 10 && (
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={settlements.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}

function MembersList({
  members,
  balances,
  groupId,
  navigate,
  handleDeleteGroup,
  deletingGroupId
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [removingId, setRemovingId] = useState(null);

  const paginatedMembers = members.slice((page - 1) * pageSize, page * pageSize);

  const handleRemoveMember = async (userId) => {
    const confirmed = window.confirm("Remove this member?");
    if (!confirmed) return;

    try {
      setRemovingId(userId);
      await groupsApi.removeMember(groupId, userId);
      window.location.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div className={styles.memberActions}>
        <Button onClick={() => navigate(`/groups/${groupId}/members/add`)}>
          + Add Member
        </Button>

        <Button
          variant="secondary"
          onClick={() => navigate(`/groups/${groupId}/edit`)}
        >
          Edit Group
        </Button>

        <Button
          variant="danger"
          loading={deletingGroupId}
          loadingText="Deleting Group..."
          onClick={handleDeleteGroup}
        >
          Delete Group
        </Button>
      </div>

      {paginatedMembers.map((m) => {
        const balance = balances.find(b => b.userName === m.name);
        const isRemoving = removingId === m.id;

        return (
          <div key={m.id || m.email} className={styles.memberItem}>
            <Avatar name={m.name || m.email} src={m.profileImageUrl} size="md" />

            <div
              className={styles.memberInfo}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%"
              }}
            >
              <div>
                <div className={styles.memberName}>{m.name}</div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginTop: "2px"
                  }}
                >
                  <div className={styles.memberEmail}>{m.email}</div>
                  {m.role !== "OWNER" && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={isRemoving}
                      loadingText="Removing..."
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMember(m.id);
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <div
                className={
                  balance?.balance >= 0 ? styles.positive : styles.negative
                }
                style={{
                  fontWeight: "bold",
                  fontSize: "1rem"
                }}
              >
                {balance ? formatCurrency(balance.balance) : "₹0"}
              </div>
            </div>
          </div>
        );
      })}

      {members.length > 10 && (
        <Pagination
          currentPage={page}
          pageSize={pageSize}
          totalItems={members.length}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPage(1);
          }}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      )}
    </div>
  );
}
