import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import groupsApi from '../../api/groupsApi';
import expensesApi from '../../api/expensesApi';
import { useForm } from '../../hooks/useForm';
import { validateExpense } from '../../utils/validators';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PageLoader } from '../../components/common/Spinner';
import styles from '../groups/groups.module.css';

const INITIAL = {
  description: '',
  amount: '',
  category: 'FOOD',
  paidByUserId: '',
  splitType: 'EQUAL'
};

const SPLIT_OPTIONS = [
  { value: 'EQUAL',      label: 'Split equally' },
  { value: 'EXACT',      label: 'Exact amounts' },
  { value: 'PERCENTAGE', label: 'By percentage' },
];

export default function EditExpensePage() {
  const { groupId, expenseId } = useParams();
  const navigate    = useNavigate();
  const [members, setMembers]   = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState(null);
  const [splits, setSplits] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues } = useForm(INITIAL, validateExpense);

  const load = useCallback(async () => {

    try {

        const [membersRes, expenseRes] = await Promise.all([
        groupsApi.getMembers(groupId),
        expensesApi.getExpense(groupId, expenseId)
        ]);

        const members = membersRes.data;
        const expense = expenseRes.data;

        setMembers(members);

        setValues({
          description: expense.description,
          amount: String(expense.amount),
          category: expense.category,
          paidByUserId: expense.paidById,
          splitType: expense.splitType
        });

        setSplits(
          expense.splits.map(split => ({
              userId: split.userId,
              value: split.shareAmount
          }))
        );
        setSelectedMembers(
            expense.splits.map(split => split.userId)
        );

    } catch (err) {
        setError(err.message);
    } finally {
        setLoadingMembers(false);
    }

    }, [groupId, expenseId, setValues]);

  useEffect(() => { load(); }, [load]);

  const memberOptions = members.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  const updateSplit = (userId, value) => {
    setSplits(prev =>
      prev.map(split =>
        split.userId === userId
          ? { ...split, value }
          : split
      )
    );
  };

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(prev =>
        prev.filter(id => id !== userId)
      );
      setSplits(prev =>
        prev.filter(split => split.userId !== userId)
      );
    } else {
      setSelectedMembers(prev => [
        ...prev,
        userId
      ]);
      setSplits(prev => [
        ...prev,
        {
          userId,
          value: ""
        }
      ]);
    }
  };

  const onSubmit = async (vals) => {
    console.log("SUBMIT CALLED", vals);
    setError(null);
    // EXACT validation
    if (vals.splitType === 'EXACT') {

      const total = splits.reduce(
        (sum, split) => sum + Number(split.value || 0),
        0
      );

      if (Math.abs(total - Number(vals.amount)) > 0.01) {
        setError('Split amounts must equal total expense');
        return;
      }
    }

    // PERCENTAGE validation
    if (vals.splitType === 'PERCENTAGE') {

      const total = splits.reduce(
        (sum, split) => sum + Number(split.value || 0),
        0
      );

      if (Math.abs(total - 100) > 0.01) {
        setError('Percentages must add up to 100');
        return;
      }
    }
    if (selectedMembers.length === 0) {
      setError("Select at least one member.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
    await expensesApi.updateExpense(
      groupId,
      expenseId,
      {
        ...vals,
        paidBy: Number(vals.paidByUserId),
        amount: parseFloat(vals.amount),

        splits:
          vals.splitType === "EQUAL"
              ? selectedMembers.map(id => ({
                    userId: id,
                    value: 0
                }))
              : splits.map(split => ({
                    userId: split.userId,
                    value: parseFloat(split.value || 0)
                }))
      }
    );

    navigate(`/groups/${groupId}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingMembers) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Edit Expense</h1>
          <p className={styles.pageSubtitle}>Update an existing expense</p>
        </div>
      </div>

      <div className={styles.formCard}>
        {error && <Alert variant="error" style={{ marginBottom: '1.5rem' }}>{error}</Alert>}

        <form className={styles.formFields} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Description"
            name="description"
            placeholder="Dinner, Hotel, Groceries…"
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.description && errors.description}
          />
          <Input
            label="Amount"
            name="amount"
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={values.amount}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.amount && errors.amount}
          />
          <Select
            label="Category"
            name="category"
            options={[
              { value: "FOOD", label: "Food" },
              { value: "TRAVEL", label: "Travel" },
              { value: "HOTEL", label: "Hotel" },
              { value: "SHOPPING", label: "Shopping" },
              { value: "OTHER", label: "Other" }
            ]}
            value={values.category}
            onChange={handleChange}
            onBlur={handleBlur}
          />

          <Select
            label="Paid by"
            name="paidByUserId"
            options={memberOptions}
            placeholder="Select member"
            value={values.paidByUserId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.paidByUserId && errors.paidByUserId}
          />

          <h4>Included Members</h4>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "20px"
            }}
          >
            {members.map(member => (

              <label
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMember(member.id)}
                />

                {member.name}

              </label>

            ))}
          </div>

          <Select
            label="Split type"
            name="splitType"
            options={SPLIT_OPTIONS}
            value={values.splitType}
            onChange={handleChange}
          />

          {values.splitType === 'EXACT' && (
            <div>
              <h4>Exact Split</h4>
              <p>
                Total : 
                ₹{splits.reduce(
                  (sum, s) => sum + Number(s.value || 0),
                  0
                )}
              </p>
              {members
              .filter(member => selectedMembers.includes(member.id))
              .map(member => (
                <Input
                  key={member.id}
                  label={member.name}
                  type="text"
                  inputMode="decimal"
                  value={
                    splits.find(s => s.userId === member.id)?.value || ''
                  }
                  onChange={(e) =>
                    updateSplit(member.id, e.target.value)
                  }
                />
              ))}
            </div>
            
          )}

          {values.splitType === 'PERCENTAGE' && (
            <div>
              <h4>Percentage Split</h4>
              <p>
                Total : 
                {splits.reduce(
                  (sum, s) => sum + Number(s.value || 0),
                  0
                )}%
              </p>
              {members
              .filter(member => selectedMembers.includes(member.id))
              .map(member => (
                <Input
                  key={member.id}
                  label={`${member.name} (%)`}
                  type="text"
                  inputMode="decimal"
                  value={
                    splits.find(s => s.userId === member.id)?.value || ''
                  }
                  onChange={(e) =>
                    updateSplit(member.id, e.target.value)
                  }
                />
              ))}
            </div>
          )}

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
