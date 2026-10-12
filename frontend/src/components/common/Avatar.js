import React, { useState, useEffect } from 'react';
import styles from './Avatar.module.css';
import { getInitials, classNames } from '../../utils/formatters';

function colorIndex(name = '') {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return Math.abs(hash) % 6;
}

export function Avatar({ name = '', src = '', size = 'md', className, onClick, style, alt }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const showImg = Boolean(src && !imgError);

  return (
    <div
      className={classNames(
        styles.avatar,
        styles[size],
        !showImg && styles[`color${colorIndex(name)}`],
        onClick && styles.clickable,
        className
      )}
      style={style}
      title={name}
      aria-label={name}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick(e) : undefined}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt || name || 'User Avatar'}
          className={styles.avatarImg}
          onError={() => setImgError(true)}
        />
      ) : (
        getInitials(name) || '?'
      )}
    </div>
  );
}

export function AvatarGroup({ names = [], avatars = [], max = 3, size = 'sm' }) {
  const items = names.map((n, i) => ({
    name: n,
    src: avatars[i] || ''
  }));
  const shown = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div className={styles.group}>
      {shown.map((item, idx) => (
        <Avatar key={item.name + idx} name={item.name} src={item.src} size={size} />
      ))}
      {overflow > 0 && (
        <div className={classNames(styles.avatar, styles[size], styles.color0)} title={`+${overflow} more`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

