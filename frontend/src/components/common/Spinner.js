import React from 'react';
import styles from './Spinner.module.css';
import { classNames } from '../../utils/formatters';

export function Spinner({ size = 'md', className }) {
  return (
    <span
      className={classNames(styles.spinner, size !== 'md' && styles[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className={styles.pageLoader}>
      <Spinner size="lg" />
      <span>{message}</span>
    </div>
  );
}

export function Skeleton({ width, height, className }) {
  return (
    <div
      className={classNames(styles.skeleton, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
