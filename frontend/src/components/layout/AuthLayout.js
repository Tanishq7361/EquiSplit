import React from 'react';
import { Outlet } from 'react-router-dom';
import EquiSplit3DLogo from '../common/EquiSplit3DLogo';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  const triggerEntrance = () => {
    if (window.triggerEquiSplitSplash) {
      window.triggerEquiSplitSplash();
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />

      <div className={styles.container}>
        <div className={styles.brandHeader} onClick={triggerEntrance} title="EquiSplit 3D">
          <EquiSplit3DLogo size="lg" animated={true} interactive={true} glow={true} />
          <div className={styles.brandName}>
            Equi<span>Split</span>
          </div>
        </div>

        <div className={styles.card}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
