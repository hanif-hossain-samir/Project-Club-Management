import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Shield,
  Menu,
  X,
  ChevronDown,
  Calendar,
  Image as ImageIcon,
  Bell,
  Home,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../theme.js';
import { useAuth } from '../auth.js';
import styles from './Navbar.module.css';

export function Navbar({ activeTab, setActiveTab, openSearchModal }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'clubs', label: 'Clubs', icon: Layers },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'announcements', label: 'Notice', icon: Bell }
  ];

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const displayName = 'Hi, hanif';

  return (
    <header className={styles.header}>
      <div className={styles.mainBar}>
        <div className={styles.inner}>
          <div className={styles.brandLockup}>
            <a
              href="https://cityuniversity.ac.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.logoLink}
              title="Click logo to visit City University official website: https://cityuniversity.ac.bd/"
              aria-label="City University Official Website"
            >
              <img
                src="/city-university-logo.jpg"
                alt="City University Official Logo"
                className={styles.logoImg}
              />
            </a>

            <button
              onClick={() => handleNav('home')}
              className={styles.brandBtn}
              aria-label="CUEC Home"
              title="City University Events & Clubs Portal"
            >
              <div className={styles.brandTitleRow}>
                <span className={styles.brandTitle}>CUEC</span>
                <span className={styles.portalTag}>Portal</span>
              </div>
              <span className={styles.brandSubtitle}>Events &amp; Clubs</span>
            </button>
          </div>

          <nav className={styles.desktopNav}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  {item.label}
                </button>
              );
            })}

            <button
              onClick={() => handleNav('dashboard')}
              className={`${styles.dashboardBtn} ${activeTab === 'dashboard' ? styles.dashboardBtnActive : ''}`}
              title="CUCC Controller Dashboard"
            >
              <Shield style={{ width: '0.875rem', height: '0.875rem' }} />
              <span>Dashboard(CC)</span>
            </button>
          </nav>

          <div className={styles.actionCluster}>
            <button
              onClick={openSearchModal}
              className={styles.searchBtn}
              title="Search clubs, events, notices (Ctrl+K)"
              aria-label="Search CUEC Portal"
            >
              <Search style={{ width: '1rem', height: '1rem' }} />
            </button>

            <button
              onClick={toggleTheme}
              aria-label={
                theme === 'light'
                  ? 'Switch to Night Mode (Dark & Deep-Red)'
                  : 'Switch to Day Mode (White & Deep-Red)'
              }
              className={styles.themeBtn}
              title={
                theme === 'light'
                  ? 'Switch to Night Mode: Dark & Deep-Red background'
                  : 'Switch to Day Mode: White & Deep-Red background'
              }
            >
              {theme === 'light' ? (
                <>
                  <div className={styles.themeIconDay}>
                    <Sun style={{ width: '0.875rem', height: '0.875rem', color: '#f59e0b', fill: '#f59e0b' }} />
                  </div>
                  <span className={styles.themeLabelDay}>Day</span>
                </>
              ) : (
                <>
                  <div className={styles.themeIconNight}>
                    <Moon style={{ width: '0.875rem', height: '0.875rem', fill: '#FF859B' }} />
                  </div>
                  <span className={styles.themeLabelNight}>Night</span>
                </>
              )}
            </button>

            <div className={styles.profileWrap}>
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={styles.profileBtn}
                title="User profile and role menu"
              >
                <span>{displayName}</span>
                <ChevronDown style={{ width: '0.875rem', height: '0.875rem', opacity: 0.8 }} />
              </button>

              {roleDropdownOpen && (
                <div
                  className={styles.dropdown}
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className={styles.dropdownHeader}>
                    <div className={styles.sessionBadgeRow}>
                      <span className={styles.pulseDot} />
                      <p className={styles.sessionLabel}>Current Session: CUCC Controller</p>
                    </div>
                    <p className={styles.sessionName}>Md. Hanif Hossain</p>
                    <p className={styles.sessionEmail}>controller.tech@cityuniversity.edu</p>
                  </div>

                  <div className={styles.scopeDetails}>
                    <div className={styles.scopeRow}>
                      <span className={styles.scopeKey}>Role:</span>
                      <span className={styles.scopeValue}>Club Controller</span>
                    </div>
                    <div className={styles.scopeRow}>
                      <span className={styles.scopeKey}>Club:</span>
                      <span className={styles.scopeClubValue}>Computer Club (CUCC)</span>
                    </div>
                    <div className={styles.scopeRow}>
                      <span className={styles.scopeKey}>Student ID:</span>
                      <span className={styles.scopeIdValue}>CU-25-CSE-02725105101098</span>
                    </div>
                    <div className={styles.scopeRow}>
                      <span className={styles.scopeKey}>Batch:</span>
                      <span className={styles.scopeValue}>CSE 66(B)</span>
                    </div>

                    <div className={styles.wingsBlock}>
                      <p className={styles.wingsHeading}>Assigned Wings (Full Access):</p>
                      <div className={styles.wingBadges}>
                        <span className={styles.wingPill}>Programming</span>
                        <span className={styles.wingPill}>Cyber Security</span>
                        <span className={styles.wingPill}>Research</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.dropdownFooter}>
                    <button
                      onClick={() => {
                        handleNav('dashboard');
                        setRoleDropdownOpen(false);
                      }}
                      className={styles.openDashboardBtn}
                    >
                      Open Controller Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={styles.hamburgerBtn}
              aria-label="Open Mobile Menu"
            >
              {mobileMenuOpen ? (
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              ) : (
                <Menu style={{ width: '1.25rem', height: '1.25rem' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileDrawerList}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavItemActive : ''}`}
                >
                  <Icon style={{ width: '1rem', height: '1rem' }} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => handleNav('dashboard')}
              className={`${styles.mobileDashboardItem} ${
                activeTab === 'dashboard' ? styles.mobileDashboardItemActive : ''
              }`}
            >
              <Shield style={{ width: '1rem', height: '1rem' }} />
              <span>Dashboard(CC)</span>
            </button>

            <a
              href="https://cityuniversity.ac.bd/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileVarsityLink}
              title="Visit City University Official Website: https://cityuniversity.ac.bd/"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <img
                  src="/city-university-logo.jpg"
                  alt="Logo"
                  style={{ width: '1.25rem', height: '1.25rem', objectFit: 'contain', borderRadius: '0.25rem' }}
                />
                <span>Visit Varsity Website (cityuniversity.ac.bd)</span>
              </div>
              <ExternalLink style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
            </a>

            <div className={styles.mobileThemeRow}>
              <span className={styles.mobileThemeText}>
                Mode: {theme === 'light' ? '☀️ Day (White & Crimson)' : '🌙 Night (Dark & Deep-Red)'}
              </span>
              <button onClick={toggleTheme} className={styles.mobileThemeSwitchBtn}>
                {theme === 'light' ? (
                  <>
                    <Moon style={{ width: '0.875rem', height: '0.875rem', color: '#404040' }} />
                    <span>Switch to Night</span>
                  </>
                ) : (
                  <>
                    <Sun style={{ width: '0.875rem', height: '0.875rem', color: '#fbbf24' }} />
                    <span>Switch to Day</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
