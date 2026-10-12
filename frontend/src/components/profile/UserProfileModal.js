import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import Button from '../common/Button';
import Input from '../common/Input';
import styles from './UserProfileModal.module.css';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fileInputRef = useRef(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setPhotoUrl(user.profileImageUrl || '');
      setUrlInput(user.profileImageUrl || '');
      setError('');
      setToast(null);
    }
  }, [isOpen, user]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) setError('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP, etc.)');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Image file size must be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result);
      setError('');
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setPhotoUrl('');
      return;
    }
    try {
      new URL(trimmed);
      setPhotoUrl(trimmed);
      setError('');
    } catch {
      setError('Please enter a valid image URL');
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required');
      return false;
    }
    if (trimmed.length < 2 || trimmed.length > 50) {
      setError('Name must be between 2 and 50 characters');
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    const payload = {
      name: name.trim(),
      profileImageUrl: photoUrl || null,
    };

    const res = await updateProfile(payload);

    setLoading(false);
    if (res.success) {
      showToast('success', 'Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setError(res.error || 'Failed to update profile');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} aria-modal="true" role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Account Profile</h2>
            <p className={styles.subtitle}>Update your personal details & profile photo</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Feedback Alert */}
        {toast && (
          <div className={`${styles.toast} ${styles[toast.type]}`}>
            <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {error && (
          <div className={styles.errorBanner}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className={styles.form}>
          {/* Avatar Section */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <Avatar
                name={name || user?.name || user?.email}
                src={photoUrl}
                size="xxl"
                className={styles.largeAvatar}
              />
              <button
                type="button"
                className={styles.changeBadge}
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
              >
                📷
              </button>
            </div>

            <div className={styles.avatarControls}>
              <span className={styles.avatarLabel}>Profile Photo</span>
              <p className={styles.avatarHint}>
                Upload a square PNG, JPG or WebP image under 3MB
              </p>

              <div className={styles.btnRow}>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload New Photo
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={handleRemovePhoto}
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {/* Optional URL tab */}
              <div className={styles.urlToggleArea}>
                <button
                  type="button"
                  className={styles.linkToggle}
                  onClick={() => setPhotoMode(m => m === 'url' ? 'upload' : 'url')}
                >
                  {photoMode === 'url' ? 'Hide image URL option' : 'Or use an image web link'}
                </button>

                {photoMode === 'url' && (
                  <div className={styles.urlInputRow}>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className={styles.urlInput}
                    />
                    <button
                      type="button"
                      className={styles.applyBtn}
                      onClick={handleUrlApply}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* User Details */}
          <div className={styles.fieldsSection}>
            <Input
              label="Full Name"
              name="name"
              type="text"
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={handleNameChange}
              disabled={loading}
              autoComplete="name"
              required
            />

            <div className={styles.emailField}>
              <span className={styles.fieldLabel}>Email Address</span>
              <div className={styles.emailDisplay}>
                <span className={styles.emailText}>{user?.email}</span>
                <span className={styles.verifiedBadge}>Verified</span>
              </div>
              <span className={styles.fieldHint}>
                Your email is tied to your account login.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              loadingText="Saving..."
              disabled={loading || !name.trim()}
            >
              Save Changes
            </Button>

          </div>
        </form>
      </div>
    </div>
  );
}
