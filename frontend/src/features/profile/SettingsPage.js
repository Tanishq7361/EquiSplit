import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const { user, updateUsername } = useAuth();
  
  // State for input, errors, loading, and toast notifications
  const [newUsername, setNewUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewUsername(val);
    
    // Clear errors immediately on typing
    if (error) setError('');
  };

  const handleBlur = () => {
    validate(newUsername);
  };

  const validate = (value) => {
    if (!value?.trim()) {
      setError('Username is required');
      return false;
    }
    
    // Trim leading whitespace
    const trimmed = value.replace(/^\s+/, '');
    
    if (trimmed.length < 2 || trimmed.length > 30) {
      setError('Username must be between 2 and 30 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError('Username must contain only letters, numbers and underscores');
      return false;
    }
    if (trimmed === user?.name) {
      setError('Username cannot be same as current username');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!validate(newUsername)) {
      return;
    }

    const trimmed = newUsername.replace(/^\s+/, '');
    
    setLoading(true);
    try {
      const res = await authApi.changeUsername({ newUsername: trimmed });
      // Update global context user state
      updateUsername(res.data.name);
      
      // Clear input and show success toast
      setNewUsername('');
      showToast('success', 'Username updated successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]} animate-fade-in`}>
          <span className={styles.toastIcon}>{toast.type === 'success' ? '✓' : '✗'}</span>
          <span className={styles.toastMessage}>{toast.message}</span>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatarGlow}>
            <span className={styles.avatarLabel}>{user?.name?.substring(0, 2).toUpperCase() || 'ES'}</span>
          </div>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.subtitle}>Manage your profile details and preferences</p>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Current Username</span>
          <span className={styles.infoValue}>{user?.name || 'Not set'}</span>
        </div>

        <form onSubmit={handleSave} className={styles.form} noValidate>
          <Input
            label="New Username"
            name="newUsername"
            type="text"
            placeholder="Enter new username"
            value={newUsername}
            onChange={handleInputChange}
            onBlur={handleBlur}
            error={error}
            disabled={loading}
            autoComplete="off"
          />

          <div className={styles.actions}>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || !!error || !newUsername.trim()}
              fullWidth
            >
              Save Username
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
