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

const TABS = [
  'Expenses',
  'Debts',
  'Settlements',
  'Members'
];

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();

  const [activeTab, setActiveTab]       = useState('Expenses');
  const [group, setGroup]               = useState(null);
  const [members, setMembers]           = useState([]);
  const [expenses, setExpenses]         = useState([]);
  const [balances, setBalances]         = useState([]);
  const [debts, setDebts]               = useState([]);
  const [settlements, setSettlements]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [gRes, mRes, eRes, bRes, dRes, sRes] = await Promise.all([
          groupsApi.getGroup(groupId),
          groupsApi.getMembers(groupId),
          expensesApi.getExpenses(groupId),
          expensesApi.getBalances(groupId),
          expensesApi.getDebts(groupId),
          settlementsApi.getSettlements(groupId),
      ]);
      setGroup(gRes.data);
      setMembers(mRes.data || []);
      setExpenses(eRes.data || []);
      setBalances(bRes.data || []);
      setDebts(dRes.data || []);
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

  const handleDeleteGroup = async () => {

    const confirmed = window.confirm(
        "Delete this group permanently?"
    );

    if (!confirmed) return;

    try {

        await groupsApi.deleteGroup(groupId);

        navigate("/groups");

    } catch (err) {

        alert(err.message);

    }
  };

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
          <Button size="sm" variant="danger" onClick={handleDeleteGroup}>
            Delete Group
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

      {activeTab === 'Expenses' && (
        <ExpensesList expenses={expenses} groupId={groupId} navigate={navigate} />
      )}
      {activeTab === 'Debts' && (
        <DebtsList debts={debts} />
      )}
      {activeTab === 'Settlements' && (
        <SettlementsList settlements={settlements} groupId={groupId} navigate={navigate} />
      )}
      {activeTab === 'Members' && (
        <MembersList members={members} balances={balances} groupId={groupId} navigate={navigate} />
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

            <div
                style={{
                    fontSize: "0.8rem",
                    color: "#94a3b8",
                    marginTop: "4px"
                }}
            >
                {formatRelativeTime(exp.createdAt)}
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
                navigate(`/groups/${groupId}/expenses/${exp.id}/edit`);
              }}
            >
            ✏️
            </button>

            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(exp.id);
              }}
            >
              Remove
            </button>

          </div>
        </div>
      ))}
    </div>
  );
}

function DebtsList({ debts }) {

  if (!debts.length) {
    return (
      <EmptyState
        icon="✅"
        title="No debts"
        description="Everyone is settled up."
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }}>
      {debts.map((debt, index) => (

        <div
          key={index}
          className={styles.balanceItem}
        >
          <div className={styles.balanceInfo}>
            <strong>{debt.fromUser}</strong> {"-->"} <strong>{debt.toUser}</strong>
          </div>
          <div className={styles.pending}>
            🛑 {formatCurrency(debt.amount)}
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
              <strong>{s.payerName}</strong>{" -> "}<strong>{s.receiverName}</strong>
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

            <button className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(s.id);
              }}
            >
            Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MembersList({ members, balances, groupId, navigate }) {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>

      {members.map((m) => {

        const balance = balances.find(
          b => b.userName === m.name
        );

        const handleRemoveMember = async (userId) => {

        const confirmed = window.confirm(
          "Remove this member?"
        );

        if (!confirmed) return;

        try {

          await groupsApi.removeMember(
            groupId,
            userId
          );

          window.location.reload();

        } catch (err) {

          alert(err.message);

        }
      };

        return (

          <div key={m.id || m.email} className={styles.memberItem}>

            <Avatar name={m.name || m.email} size="md" />

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
                  <div className={styles.memberName}>
                      {m.name}
                  </div>

                  <div
                      style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginTop: "2px"
                      }}
                  >
                      <div className={styles.memberEmail}>
                          {m.email}
                      </div>

                      {m.role !== "OWNER" && (
                          <button
                            className={styles.deleteBtnSm}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveMember(m.id);
                              }}
                          >
                              Remove
                          </button>
                      )}
                  </div>
              </div>

              <div
                  className={
                      balance?.balance >= 0
                          ? styles.positive
                          : styles.negative
                  }
                  style={{
                      fontWeight: "bold",
                      fontSize: "1rem"
                  }}
              >
                  {balance
                      ? formatCurrency(balance.balance)
                      : "₹0"}
              </div>

            </div>

          </div>

        );
      })}

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
