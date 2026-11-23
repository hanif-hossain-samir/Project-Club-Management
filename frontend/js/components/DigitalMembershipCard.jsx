import React from 'react';
import { Shield, QrCode, CheckCircle2, Printer, Award, X } from 'lucide-react';
import styles from './DigitalMembershipCard.module.css';

export const DigitalMembershipCard = ({ user, onClose }) => {
  const cardSerial = `CUEC-${(user.studentId || '').replace(/[^A-Za-z0-9]/g, '')}-${(user.joinedAt || '').split('-')[0] || '2026'}`;

  const getWingTitle = (wing) => {
    switch (wing) {
      case 'programming':
        return 'Programming Wing';
      case 'cyber_security':
        return 'Cyber Security Wing';
      case 'research':
        return 'Research & AI Wing';
      case 'sports':
        return 'Sports & Athletics Wing';
      case 'cultural':
        return 'Cultural & Arts Wing';
      case 'tour':
        return 'Tour & Adventure Wing';
      default:
        return 'Central Member';
    }
  };

  const getClubName = (club) => {
    if (club === 'computer_club') return 'City University Computer Club';
    if (club === 'events_and_clubs') return 'City University Events & Clubs';
    return 'City University Events & Club (CUEC)';
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        )}

        <div id="cuec-membership-card" className={styles.cardOuter}>
          <div className={styles.idCard}>
            <div className={styles.watermark}>
              <Shield style={{ width: '14rem', height: '14rem', color: '#ffffff' }} />
            </div>

            <div className={styles.cardTop}>
              <div className={styles.brandRow}>
                <div className={styles.logoBox}>
                  <img
                    src="/city-university-logo.jpg"
                    alt="City University Official Logo"
                    className={styles.logoImg}
                  />
                </div>
                <div>
                  <h4 className={styles.uniName}>CITY UNIVERSITY</h4>
                  <p className={styles.cardSub}>Official Club Membership Card</p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={styles.activeBadge}>
                  <CheckCircle2 style={{ width: '0.75rem', height: '0.75rem' }} /> ACTIVE
                </span>
                <p className={styles.expDate}>EXP: DEC 2027</p>
              </div>
            </div>

            <div className={styles.studentRow}>
              <div className={styles.avatarWrap}>
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=D40000`
                  }
                  alt={user.name}
                  className={styles.avatarImg}
                />
                <div className={styles.awardBadge}>
                  <Award style={{ width: '0.875rem', height: '0.875rem' }} />
                </div>
              </div>

              <div className={styles.studentInfo}>
                <h3 className={styles.studentName}>{user.name}</h3>
                <p className={styles.studentId}>ID: {user.studentId}</p>
                <p className={styles.studentDept}>Dept: {user.department}</p>
                <div className={styles.wingTag}>{getWingTitle(user.assignedWing)}</div>
              </div>
            </div>

            <div className={styles.orgBanner}>
              <div className={styles.orgLabel}>Affiliated Organization</div>
              <div className={styles.orgName}>{getClubName(user.clubAffiliation)}</div>
            </div>

            <div className={styles.qrStrip}>
              <div>
                <span className={styles.serialLabel}>Serial Token</span>
                <span className={styles.serialVal}>{cardSerial}</span>
              </div>

              <div className={styles.qrBox}>
                <QrCode style={{ width: '1.75rem', height: '1.75rem' }} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.authNote}>Authorized by City University DSW</p>
          <div className={styles.footerBtns}>
            <button type="button" onClick={() => window.print()} className={styles.printBtn}>
              <Printer style={{ width: '0.875rem', height: '0.875rem' }} />
              Print / Save
            </button>
            {onClose && (
              <button type="button" onClick={onClose} className={styles.closeActionBtn}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
