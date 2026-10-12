import React, { useState, useRef } from 'react';
import styles from './EquiSplit3DLogo.module.css';

export default function EquiSplit3DLogo({
  size = 'md',
  animated = true,
  interactive = true,
  glow = true,
  onClick,
  className = '',
}) {
  const containerRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 12, y: -14 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 28;
    const rotY = ((x - centerX) / centerX) * 28;

    setRotate({ x: rotX, y: rotY });
  };

  const handleMouseEnter = () => {
    if (interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
      setRotate({ x: 12, y: -14 });
    }
  };

  const sizeClass = styles[`size-${size}`] || styles['size-md'];

  return (
    <div
      ref={containerRef}
      className={`${styles.logoContainer} ${sizeClass} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      role="img"
      aria-label="EquiSplit 3D Logo"
    >
      <div
        className={`${styles.scene} ${animated && !isHovered ? styles.floating : ''}`}
        style={
          isHovered
            ? {
                transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.08, 1.08, 1.08)`,
                transition: 'transform 0.08s ease-out',
              }
            : undefined
        }
      >
        {/* Ambient Glow */}
        {glow && (
          <div
            className={styles.glowAura}
            style={{
              width: size === 'xl' ? '180px' : size === 'lg' ? '100px' : '60px',
              height: size === 'xl' ? '180px' : size === 'lg' ? '100px' : '60px',
            }}
          />
        )}

        {/* 3D Floor Shadow */}
        <div className={styles.shadow3D} />

        {/* 3D Prism Structure */}
        <div className={`${styles.prismWrapper} ${sizeClass}`}>
          {/* Left Facet (Deep Blue) */}
          <div className={styles.facetLeft}>
            <div className={styles.sheen} />
          </div>

          {/* Right Facet (Cyan / Sapphire) */}
          <div className={styles.facetRight}>
            <div className={styles.sheen} />
          </div>

          {/* Central Glowing Split Core */}
          <div className={styles.splitCore} />
        </div>
      </div>
    </div>
  );
}
