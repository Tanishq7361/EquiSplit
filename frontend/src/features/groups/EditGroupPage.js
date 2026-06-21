import React, { useState, useEffect } from "react";
import groupsApi from '../../api/groupsApi';
import { useForm } from '../../hooks/useForm';
import { validateGroup } from '../../utils/validators';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import styles from './groups.module.css';
import { PageLoader } from "../../components/common/Spinner";
import { useNavigate, useParams } from "react-router-dom";

const INITIAL = { name: '', description: '' };

export default function EditGroupPage() {
  const navigate = useNavigate();
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError]     = useState(null);
  const { groupId } = useParams();
  const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues } =
    useForm(INITIAL, validateGroup);
    useEffect(() => {
        let mounted = true;

        const loadGroup = async () => {
            try {
                const { data } = await groupsApi.getGroup(groupId);

                if (!mounted) return;

                setValues({
                    name: data.name,
                    description: data.description || ""
                });
            } catch (err) {
                if (mounted) {
                    setError(err.message);
                }
            } finally {
                if (mounted) {
                    setLoadingGroup(false);
                }
            }
        };

        loadGroup();

        return () => {
            mounted = false;
        };
    }, [groupId, setValues]);

  const onSubmit = async (vals) => {
    setSaving(true);
    setError(null);
    try {
      await groupsApi.updateGroup(groupId, vals);
      navigate(`/groups/${groupId}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

    if (loadingGroup) {
        return <PageLoader />;
    }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Edit Group</h1>
          <p className={styles.pageSubtitle}>Update your group's name and description</p>
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
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
