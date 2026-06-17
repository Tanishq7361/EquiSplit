import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import groupsApi from '../../api/groupsApi';
import { useForm } from '../../hooks/useForm';
import { validateMember } from '../../utils/validators';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import styles from './groups.module.css';

const INITIAL = { email: '' };

export default function AddMemberPage() {
  const { groupId } = useParams();
  const navigate    = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(false);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit, reset } =
    useForm(INITIAL, validateMember);

  const onSubmit = async (vals) => {
    setLoading(true);
    setError(null);
    try {
      await groupsApi.addMember(groupId, vals);
      setSuccess(true);
      reset();
      setTimeout(() => navigate(`/groups/${groupId}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Add Member</h1>
          <p className={styles.pageSubtitle}>Invite someone to join this group</p>
        </div>
      </div>

      <div className={styles.formCard}>
        {error   && <Alert variant="error"   style={{ marginBottom: '1.5rem' }}>{error}</Alert>}
        {success && <Alert variant="success" style={{ marginBottom: '1.5rem' }}>Member added successfully!</Alert>}

        <form className={styles.formFields} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="friend@example.com"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email && errors.email}
            hint="The person must already have an EquiSplit account."
          />
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
