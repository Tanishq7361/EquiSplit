import React from 'react';
import styles from './Button.module.css';
import { classNames } from '../../utils/formatters';

/**
 * Reusable button with variant, size, loading, and fullWidth support.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={classNames(
        styles.btn,
        styles[variant],
        size !== 'md' && styles[size],
        fullWidth && styles.fullWidth,
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  );
}
