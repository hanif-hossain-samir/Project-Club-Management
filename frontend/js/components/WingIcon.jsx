import React from 'react';
import { Code2 } from 'lucide-react';
import styles from './WingIcon.module.css';

export const WING_CUSTOM_ICONS = {
  cyber_security: {
    red: '/assets/icons/cyber_security_red.png',
    pink: '/assets/icons/cyber_security_pink.png',
    white: '/assets/icons/cyber_security_white.png',
    label: 'Cyber Security'
  },
  research: {
    red: '/assets/icons/research_red.png',
    pink: '/assets/icons/research_pink.png',
    white: '/assets/icons/research_white.png',
    label: 'Research'
  },
  sports: {
    red: '/assets/icons/sports_red.png',
    pink: '/assets/icons/sports_pink.png',
    white: '/assets/icons/sports_white.png',
    label: 'Sports'
  },
  cultural: {
    red: '/assets/icons/cultural_red.png',
    pink: '/assets/icons/cultural_pink.png',
    white: '/assets/icons/cultural_white.png',
    label: 'Cultural'
  },
  tour: {
    red: '/assets/icons/tour_red.png',
    pink: '/assets/icons/tour_pink.png',
    white: '/assets/icons/tour_white.png',
    label: 'Tour'
  }
};

export function WingIcon({ slug, size = 'md', isSelected = false }) {
  const custom = WING_CUSTOM_ICONS[slug];
  const sizeClass = size === 'lg' ? styles.sizeLg : styles.sizeDefault;

  if (custom) {
    if (isSelected) {
      return (
        <span className={`${styles.iconWrapper} ${sizeClass}`}>
          <img
            src={custom.white}
            alt={custom.label}
            className={styles.iconImg}
            loading="eager"
          />
        </span>
      );
    }

    return (
      <span className={`${styles.iconWrapper} ${sizeClass}`}>
        <img
          src={custom.red}
          alt={custom.label}
          className={`${styles.iconImg} ${styles.darkHidden}`}
          loading="eager"
        />
        <img
          src={custom.pink}
          alt={custom.label}
          className={`${styles.iconImg} ${styles.darkBlock}`}
          loading="eager"
        />
      </span>
    );
  }

  return (
    <Code2
      className={`${sizeClass} ${isSelected ? styles.codeIconSelected : styles.codeIconDefault}`}
    />
  );
}
