import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import groupsApi from '../../api/groupsApi';
import expensesApi from '../../api/expensesApi';
import settlementsApi from '../../api/settlementsApi';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import { Avatar } from '../../components/common/Avatar';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import styles from './groups.module.css';

const TABS = ['Expenses', 'Balances', 'Settlements', 'Members'];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();

  const [activeTab, setActiveTab]       = useState('Expenses');
  const [group, setGroup]               = useState(null);
  const [members, setMembers]           = useState([]);
  const [expenses, setExpenses]         = useState([]);
  const [balances, setBalances]         = useState([]);
  const [settlements, setSettlements]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [gRes, mRes, eRes, bRes, sRes] = await Promise.all([
        groupsApi.getGroup(groupId),
        groupsApi.getMembers(groupId),
        expensesApi.getExpenses(groupId),
        expensesApi.getBalances(groupId),
        settlementsApi.getSettlements(groupId),
      ]);
      setGroup(gRes.data);
      setMembers(mRes.data || []);
      setExpenses(eRes.data || []);
      setBalances(bRes.data || []);
      setSettlements(sRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoader />;
  if (error)   return <Alert variant="error">{error}</Alert>;
  if (!group)  return null;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{group.name}</h1>
          {group.description && <p className={styles.pageSubtitle}>{group.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/groups/${groupId}/members/add`)}>
            + Member
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate(`/groups/${groupId}/expenses/new`)}>
            + Expense
          </Button>
          <Button size="sm" onClick={() => navigate(`/groups/${groupId}/settlements/new`)}>
            Settle Up
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Expenses' && (
        <ExpensesList expenses={expenses} groupId={groupId} navigate={navigate} />
      )}
      {activeTab === 'Balances' && (
        <BalancesList balances={balances} members={members} navigate={navigate} groupId={groupId} />
      )}
      {activeTab === 'Settlements' && (
        <SettlementsList settlements={settlements} groupId={groupId} navigate={navigate} />
      )}
      {activeTab === 'Members' && (
        <MembersList members={members} groupId={groupId} navigate={navigate} />
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function ExpensesList({ expenses, groupId, navigate }) {
  const [expandedExpense, setExpandedExpense] = useState(null);
  const handleDelete = async (expenseId) => {
    const confirmed = window.confirm(
      "Delete this expense?"
    );

    if (!confirmed) return;

    try {
      await expensesApi.deleteExpense(
        groupId,
        expenseId
      );

      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  };
  if (expenses.length === 0) return (
    <EmptyState
      icon="💸"
      title="No expenses yet"
      description="Add the first expense to get started."
      action={() => navigate(`/groups/${groupId}/expenses/new`)}
      actionLabel="Add expense"
    />
  );
  return (
    <div className={styles.list}>
      {expenses.map((exp) => (
        <div key={exp.id} className={styles.expenseItem}
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
              {expandedExpense === exp.id ? '▲' : '▼'}
            </div>
            <div className={styles.expenseMeta}>
              Paid by {exp.paidByName || exp.paidBy}
            </div>
              {expandedExpense === exp.id && (
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '0.9rem',
                  color: '#cbd5e1'
                }}
              >
                <div>
                  <strong>Category:</strong> {exp.category}
                </div>

                <div>
                  <strong>Split Type:</strong> {exp.splitType}
                </div>

                <div style={{ marginTop: '8px' }}>
                  <strong>Split Details</strong>
                </div>

                {exp.splits?.map((split, idx) => (
                  <div key={idx}>
                    {split.userName}: ₹{split.shareAmount}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className={styles.expenseAmount}>
              {formatCurrency(exp.amount)}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(exp.id);
              }}
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function BalancesList({ balances }) {

  if (!balances.length) {
    return (
      <EmptyState
        icon="✓"
        title="All settled up"
        description="No outstanding balances."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {balances.map((b, i) => (
        <div key={i} className={styles.balanceItem}>
          <div className={styles.balanceInfo}>
            <div>
              <strong>{b.userName}</strong>
            </div>

            <div>
              Net Balance:
              {b.balance >= 0 ? ' +' : ' '}
              {formatCurrency(b.balance)}
            </div>
          </div>

          <div
            className={
              b.balance >= 0
                ? styles.positive
                : styles.negative
            }
          >
            {formatCurrency(b.balance)}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettlementsList({ settlements, groupId, navigate }) {
  const handleDelete = async (settlementId) => {
    const confirmed = window.confirm(
      "Delete this settlement?"
    );

    if (!confirmed) return;

    try {

      await settlementsApi.deleteSettlement(
        groupId,
        settlementId
      );

      window.location.reload();

    } catch (err) {
      alert(err.message);
    }
  };

  if (!settlements.length) return (
    <EmptyState
      icon="↔"
      title="No settlements yet"
      description="Record a payment between members."
      action={() => navigate(`/groups/${groupId}/settlements/new`)}
      actionLabel="Record settlement"
    />
  );
  return (
    <div className={styles.list}>
      {settlements.map((s) => (
        <div key={s.id} className={styles.settlementItem}>
          <div className={styles.settlementIcon}>✓</div>
          <div className={styles.settlementInfo}>
            <div className={styles.settlementText}>
              <strong>{s.payerName || s.payerId}</strong> paid <strong>{s.payeeName || s.payeeId}</strong>
            </div>
            <div className={styles.settlementDate}>{formatRelativeTime(s.createdAt)}</div>
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

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(s.id);
              }}
            >
              🗑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MembersList({ members, groupId, navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {members.map((m) => (
        <div key={m.id || m.email} className={styles.memberItem}>
          <Avatar name={m.name || m.email} size="md" />
          <div className={styles.memberInfo}>
            <div className={styles.memberName}>{m.name || '—'}</div>
            <div className={styles.memberEmail}>{m.email}</div>
          </div>
        </div>
      ))}
      <Button
        size="sm"
        variant="secondary"
        style={{ alignSelf: 'flex-start', marginTop: 'var(--space-4)' }}
        onClick={() => navigate(`/groups/${groupId}/members/add`)}
      >
        + Add member
      </Button>
    </div>
  );
}
