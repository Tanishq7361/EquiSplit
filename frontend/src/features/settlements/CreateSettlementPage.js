import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import groupsApi from '../../api/groupsApi';
import settlementsApi from '../../api/settlementsApi';
import { useForm } from '../../hooks/useForm';
import { validateSettlement } from '../../utils/validators';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { PageLoader } from '../../components/common/Spinner';
import styles from '../groups/groups.module.css';

const INITIAL = { receiverId: '', amount: '', notes: '' };

export default function CreateSettlementPage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const [members, setMembers]     = useState([]);
  const [loadingM, setLoadingM]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await groupsApi.getMembers(groupId);
      setMembers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingM(false);
    }
  }, [groupId]);

  useEffect(() => { load(); }, [load]);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm(INITIAL, validateSettlement);

  const memberOptions = members.map((m) => ({
    value: m.id || m.email,
    label: m.name || m.email,
  }));

  const onSubmit = async (vals) => {
    setSubmitting(true);
    setError(null);
    try {
      await settlementsApi.createSettlement(groupId, {
          receiverId: Number(vals.receiverId),
          amount: parseFloat(vals.amount)
      });
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingM) return <PageLoader />;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Record Settlement</h1>
          <p className={styles.pageSubtitle}>Record a payment between group members</p>
        </div>
      </div>

      <div className={styles.formCard}>
        {error && <Alert variant="error" style={{ marginBottom: '1.5rem' }}>{error}</Alert>}

        <form className={styles.formFields} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Select
            label="Who received?"
            name="receiverId"
            options={memberOptions}
            placeholder="Select receiver"
            value={values.receiverId}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.receiverId && errors.receiverId}
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
          <Input
            label="Notes (optional)"
            name="notes"
            placeholder="Cash, bank transfer…"
            value={values.notes}
            onChange={handleChange}
          />

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Record settlement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
