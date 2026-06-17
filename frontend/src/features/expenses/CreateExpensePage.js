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
  paidBy: '',
  splitType: 'EQUAL'
};

const SPLIT_OPTIONS = [
  { value: 'EQUAL',      label: 'Split equally' },
  { value: 'EXACT',      label: 'Exact amounts' },
  { value: 'PERCENTAGE', label: 'By percentage' },
];

export default function CreateExpensePage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const [members, setMembers]   = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await groupsApi.getMembers(groupId);
      setMembers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMembers(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm(INITIAL, validateExpense);

  const memberOptions = members.map((m) => ({
    value: m.id || m.email,
    label: m.name || m.email,
  }));

  const onSubmit = async (vals) => {
    setSubmitting(true);
    setError(null);
    try {
      await expensesApi.createExpense(groupId, {
        ...vals,
        amount: parseFloat(vals.amount),
      });
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
          <h1 className={styles.pageTitle}>Add Expense</h1>
          <p className={styles.pageSubtitle}>Record a shared expense for this group</p>
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
            type="number"
            min="0.01"
            step="0.01"
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
            name="paidBy"
            options={memberOptions}
            placeholder="Select member"
            value={values.paidBy}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.paidBy && errors.paidBy}
          />
          <Select
            label="Split type"
            name="splitType"
            options={SPLIT_OPTIONS}
            value={values.splitType}
            onChange={handleChange}
          />

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Add expense
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
