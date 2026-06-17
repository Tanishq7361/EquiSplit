import React from 'react';
import styles from './EmptyState.module.css';
import Button from './Button';

export default function EmptyState({ icon, title, description, action, actionLabel }) {
  return (
    <div className={styles.container}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && actionLabel && (
        <Button onClick={action} variant="primary" size="sm">{actionLabel}</Button>
      )}
    </div>
  );
}
