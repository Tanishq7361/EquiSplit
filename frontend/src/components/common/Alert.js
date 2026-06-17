import React from 'react';
import styles from './Alert.module.css';
import { classNames } from '../../utils/formatters';

const ICONS = {
  error:   '⚠',
  success: '✓',
  warning: '!',
  info:    'ℹ',
};

export default function Alert({ variant = 'error', title, children, className }) {
  return (
    <div
      className={classNames(styles.alert, styles[variant], className)}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className={styles.icon} aria-hidden="true">{ICONS[variant]}</span>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
