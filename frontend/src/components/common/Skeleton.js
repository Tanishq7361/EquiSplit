import React from 'react';
import styles from './Skeleton.module.css';

/**
 * Base animated shimmer placeholder component.
 */
export function Skeleton({
  width,
  height,
  borderRadius,
  circle = false,
  className = '',
  style = {},
}) {
  const customStyle = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: circle ? '50%' : borderRadius || 'var(--radius-sm)',
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={customStyle}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for an individual expense row item.
 */
export function ExpenseRowSkeleton() {
  return (
    <div className={styles.expenseSkeletonItem}>
      <Skeleton circle width="40px" height="40px" />
      <div className={styles.expenseSkeletonInfo}>
        <Skeleton width="45%" height="16px" style={{ marginBottom: '6px' }} />
        <Skeleton width="30%" height="12px" style={{ marginBottom: '4px' }} />
        <Skeleton width="20%" height="10px" />
      </div>
      <div className={styles.expenseSkeletonRight}>
        <Skeleton width="70px" height="20px" style={{ marginBottom: '6px' }} />
        <div style={{ display: 'flex', gap: '6px' }}>
          <Skeleton width="28px" height="28px" borderRadius="var(--radius-sm)" />
          <Skeleton width="55px" height="28px" borderRadius="var(--radius-sm)" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for a group card on Dashboard / Groups page.
 */
export function GroupCardSkeleton() {
  return (
    <div className={styles.groupCardSkeleton}>
      <div className={styles.groupCardTop}>
        <Skeleton circle width="38px" height="38px" />
        <Skeleton width="60px" height="20px" borderRadius="100px" />
      </div>
      <div className={styles.groupCardBody}>
        <Skeleton width="65%" height="20px" style={{ marginBottom: '8px' }} />
        <Skeleton width="90%" height="13px" style={{ marginBottom: '4px' }} />
        <Skeleton width="75%" height="13px" />
      </div>
      <div className={styles.groupCardBottom}>
        <div style={{ display: 'flex', gap: '-8px' }}>
          <Skeleton circle width="26px" height="26px" />
          <Skeleton circle width="26px" height="26px" style={{ marginLeft: '-8px' }} />
          <Skeleton circle width="26px" height="26px" style={{ marginLeft: '-8px' }} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Skeleton width="65px" height="20px" borderRadius="100px" />
          <Skeleton width="65px" height="20px" borderRadius="100px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for a metric / stat card on the Dashboard.
 */
export function StatCardSkeleton() {
  return (
    <div className={styles.statCardSkeleton}>
      <div className={styles.statTop}>
        <Skeleton width="90px" height="13px" />
        <Skeleton circle width="34px" height="34px" />
      </div>
      <Skeleton width="120px" height="28px" style={{ margin: '10px 0 6px 0' }} />
      <Skeleton width="130px" height="11px" />
    </div>
  );
}

/**
 * Skeleton for a member list row item.
 */
export function MemberRowSkeleton() {
  return (
    <div className={styles.memberSkeletonItem}>
      <Skeleton circle width="40px" height="40px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="140px" height="16px" style={{ marginBottom: '6px' }} />
        <Skeleton width="180px" height="12px" />
      </div>
      <Skeleton width="80px" height="20px" borderRadius="100px" />
    </div>
  );
}

/**
 * Skeleton for a settlement transaction row item.
 */
export function SettlementRowSkeleton() {
  return (
    <div className={styles.settlementSkeletonItem}>
      <Skeleton circle width="36px" height="36px" />
      <div style={{ flex: 1 }}>
        <Skeleton width="160px" height="15px" style={{ marginBottom: '6px' }} />
        <Skeleton width="100px" height="11px" />
      </div>
      <Skeleton width="75px" height="20px" />
    </div>
  );
}

/**
 * Skeleton for a debt item.
 */
export function DebtItemSkeleton() {
  return (
    <div className={styles.debtSkeletonItem}>
      <Skeleton width="180px" height="16px" />
      <Skeleton width="85px" height="22px" borderRadius="100px" />
    </div>
  );
}

/**
 * Skeleton for charts / analytics block.
 */
export function AnalyticsSkeleton() {
  return (
    <div className={styles.analyticsSkeleton}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <Skeleton width="160px" height="20px" style={{ marginBottom: '6px' }} />
          <Skeleton width="220px" height="12px" />
        </div>
      </div>
      <div className={styles.chartsGridSkeleton}>
        <div className={styles.chartBoxSkeleton}>
          <Skeleton circle width="160px" height="160px" style={{ margin: '0 auto' }} />
        </div>
        <div className={styles.chartBoxSkeleton}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '160px', gap: '16px', justifyContent: 'center' }}>
            <Skeleton width="24px" height="40%" />
            <Skeleton width="24px" height="70%" />
            <Skeleton width="24px" height="55%" />
            <Skeleton width="24px" height="90%" />
            <Skeleton width="24px" height="45%" />
          </div>
        </div>
      </div>
    </div>
  );
}
