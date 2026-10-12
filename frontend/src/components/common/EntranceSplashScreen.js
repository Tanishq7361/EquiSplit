import React, { useState, useEffect } from 'react';
import EquiSplit3DLogo from './EquiSplit3DLogo';
import styles from './EntranceSplashScreen.module.css';

export default function EntranceSplashScreen({ onComplete, duration = 2100 }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 650);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.splashOverlay} ${isExiting ? styles.exiting : ''}`}
      onClick={handleDismiss}
      title="Click to enter"
    >
      <div className={styles.bgGlow} />

      <div className={styles.content}>
        <div className={styles.haloRing} />

        <div className={styles.logo3DWrap}>
          <EquiSplit3DLogo size="xl" animated={true} interactive={true} glow={true} />
        </div>

        <h1 className={styles.brandTitle}>EquiSplit</h1>
        <p className={styles.brandSubtitle}>Clean &bull; Simple &bull; Modern</p>

        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill} />
        </div>
      </div>

      <span className={styles.skipHint}>Click anywhere to enter</span>
    </div>
  );
}
