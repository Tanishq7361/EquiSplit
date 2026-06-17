import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import groupsApi from '../../api/groupsApi';
import { useForm } from '../../hooks/useForm';
import { validateGroup } from '../../utils/validators';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import styles from './groups.module.css';

const INITIAL = { name: '', description: '' };

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const { values, errors, touched, handleChange, handleBlur, handleSubmit } =
    useForm(INITIAL, validateGroup);

  const onSubmit = async (vals) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await groupsApi.createGroup(vals);
      navigate(`/groups/${data.id}`);
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
          <h1 className={styles.pageTitle}>New Group</h1>
          <p className={styles.pageSubtitle}>Create a group to start splitting expenses</p>
        </div>
      </div>

      <div className={styles.formCard}>
        {error && <Alert variant="error" style={{ marginBottom: '1.5rem' }}>{error}</Alert>}

        <form className={styles.formFields} onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Group name"
            name="name"
            placeholder="Weekend trip, Apartment, etc."
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.name && errors.name}
          />
          <Input
            label="Description (optional)"
            name="description"
            as="textarea"
            rows={3}
            placeholder="What's this group for?"
            value={values.description}
            onChange={handleChange}
            style={{ resize: 'vertical', minHeight: 80 }}
          />
          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create group
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
