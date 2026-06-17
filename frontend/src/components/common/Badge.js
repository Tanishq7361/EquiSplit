import React from 'react';
import { classNames } from '../../utils/formatters';

const styles = {
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
};

const VARIANTS = {
  default: { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
  accent:  { background: 'var(--color-accent-glow)', color: 'var(--color-accent-text)', border: '1px solid var(--color-accent)' },
  success: { background: 'var(--color-success-dim)', color: 'var(--color-success)', border: '1px solid var(--color-success)' },
  danger:  { background: 'var(--color-danger-dim)',  color: 'var(--color-danger)',  border: '1px solid var(--color-danger)' },
  gold:    { background: 'var(--color-gold-dim)',    color: 'var(--color-gold)',    border: '1px solid var(--color-gold)' },
};

export default function Badge({ children, variant = 'default' }) {
  return (
    <span style={{ ...styles.badge, ...VARIANTS[variant] }}>
      {children}
    </span>
  );
}
