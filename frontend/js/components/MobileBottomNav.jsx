import React from 'react';
import { Home, Layers, Calendar, Image as ImageIcon, Bell, Shield } from 'lucide-react';
import styles from './MobileBottomNav.module.css';

export function MobileBottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'clubs', label: 'Clubs', icon: Layers },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'announcements', label: 'Notice', icon: Bell },
    { id: 'dashboard', label: 'Dashboard(CC)', icon: Shield }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav aria-label="Mobile Bottom Navigation Bar" className={styles.nav}>
      <div className={styles.grid}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`${styles.itemBtn} ${isActive ? styles.itemBtnActive : ''}`}
            >
              <div className={`${styles.iconBox} ${isActive ? styles.iconBoxActive : ''}`}>
                <Icon
                  style={{ width: '1.25rem', height: '1.25rem' }}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {isActive && <span className={styles.dot} />}
              </div>

              <span className={`${styles.label} ${isActive ? styles.labelActive : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
