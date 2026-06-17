import React from 'react';
import styles from './Avatar.module.css';
import { getInitials, classNames } from '../../utils/formatters';

function colorIndex(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hash) % 6;
}

export function Avatar({ name = '', size = 'md', className }) {
  return (
    <div
      className={classNames(styles.avatar, styles[size], styles[`color${colorIndex(name)}`], className)}
      title={name}
      aria-label={name}
    >
      {getInitials(name) || '?'}
    </div>
  );
}

export function AvatarGroup({ names = [], max = 3, size = 'sm' }) {
  const shown   = names.slice(0, max);
  const overflow = names.length - max;
  return (
    <div className={styles.group}>
      {shown.map((n) => <Avatar key={n} name={n} size={size} />)}
      {overflow > 0 && (
        <div className={classNames(styles.avatar, styles[size], styles.color0)} title={`+${overflow} more`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}
