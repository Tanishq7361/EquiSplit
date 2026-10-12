import React from 'react';
import styles from './Button.module.css';
import { classNames } from '../../utils/formatters';

/**
 * Reusable button with variant, size, loading, loadingText, and fullWidth support.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  fullWidth = false,
  className,
  type = 'button',
  onClick,
  ...props
}) {
  const handleClick = (e) => {
    if (loading || props.disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={classNames(
        styles.btn,
        styles[variant],
        size !== 'md' && styles[size],
        fullWidth && styles.fullWidth,
        loading && styles.isLoading,
        className
      )}
      disabled={loading || props.disabled}
      aria-busy={loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <span className={classNames(styles.spinner, styles[`spinner_${variant}`])} aria-hidden="true" />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}
