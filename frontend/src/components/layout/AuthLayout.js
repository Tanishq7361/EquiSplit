import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.layout}>
      <div className={styles.brand}>
        <div className={styles.brandGlow} />
        <div className={styles.brandIcon}>⚖</div>
        <h1 className={styles.brandTitle}>Equi<span>Split</span></h1>
        <p className={styles.brandTagline}>
          Track shared expenses, settle debts, and keep friendships intact.
        </p>
        <div className={styles.features}>
          {[
            ['◈', 'Organise expenses by group'],
            ['⬡', 'Smart balance calculation'],
            ['↔', 'One-tap settlements'],
          ].map(([icon, text]) => (
            <div key={text} className={styles.feature}>
              <span className={styles.featureIcon}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formBox}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
