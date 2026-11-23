import React from 'react';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer({ setActiveTab }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.topBanner}>
        <div className={styles.topBannerInner}>
          <div className={styles.brandLockup}>
            <div className={styles.crestCircle}>
              <img
                src="/city-university-logo.jpg"
                alt="City University Crest"
                className={styles.crestImg}
              />
            </div>
            <div>
              <div className={styles.bannerTitleRow}>
                <span>City University Events &amp; Club (CUEC)</span>
                <a
                  href="https://cityuniversity.ac.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.bannerLink}
                  title="Visit City University Official Website"
                >
                  <ExternalLink style={{ width: '1rem', height: '1rem', color: '#ffffff', display: 'inline-block', marginBottom: '2px' }} />
                </a>
              </div>
              <p className={styles.tagline}>...creating a culture of excellence</p>
            </div>
          </div>

          <div className={styles.bannerActions}>
            <button
              onClick={() => setActiveTab?.('events')}
              className={styles.calendarBtn}
            >
              View Calendar
            </button>
          </div>
        </div>
      </div>

      <div className={styles.mainSection}>
        <div className={styles.grid}>
          <div className={styles.col}>
            <h4 className={styles.colHeading}>ABOUT CUEC</h4>
            <p className={styles.aboutDesc}>
              The central authority coordinating extracurricular, academic, and athletic life at City University.
            </p>
            <div className={styles.contactList}>
              <div className={styles.contactItemTop}>
                <MapPin style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0, marginTop: '2px' }} />
                <span>Permanent Campus, Khagan, Birulia, Savar, Dhaka</span>
              </div>
              <div className={styles.contactItem}>
                <Phone style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0 }} />
                <span>+880 2-9876543 (Ext. 201/305)</span>
              </div>
              <div className={styles.contactItem}>
                <Mail style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0 }} />
                <span>dsw.cuec@cityuniversity.edu</span>
              </div>
            </div>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colHeading}>1. COMPUTER CLUB</h4>
            <ul className={styles.linkList}>
              <li>
                <button onClick={() => setActiveTab?.('clubs')} className={styles.linkBtn}>
                  <span className={styles.bullet}>•</span>
                  <strong className={styles.strongName}>Programming Club:</strong> ICPC, Hackathons &amp; Software Engineering
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab?.('clubs')} className={styles.linkBtn}>
                  <span className={styles.bullet}>•</span>
                  <strong className={styles.strongName}>Cyber Security Club:</strong> CTFs, Ethical Hacking &amp; Blue Teaming
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab?.('clubs')} className={styles.linkBtn}>
                  <span className={styles.bullet}>•</span>
                  <strong className={styles.strongName}>Research Club:</strong> AI, Machine Learning &amp; IEEE Publications
                </button>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colHeading}>2. EVENTS &amp; CLUBS</h4>
            <ul className={styles.linkList}>
              <li>
                <button onClick={() => setActiveTab?.('clubs')} className={styles.linkBtn}>
                  <span className={styles.bullet}>•</span>
                  <strong className={styles.strongName}>Sports Club:</strong> CPCL Cricket, Football &amp; Indoor Badminton
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab?.('clubs')} className={styles.linkBtn}>
                  <span className={styles.bullet}>•</span>
                  <strong className={styles.strongName}>Cultural Club:</strong> Rhythm of City, Drama &amp; Classical Music
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab?.('clubs')} className={styles.linkBtn}>
                  <span className={styles.bullet}>•</span>
                  <strong className={styles.strongName}>Tour &amp; Adventure Club:</strong> Sajek Treks &amp; Coastal Expeditions
                </button>
              </li>
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colHeading}>CENTRAL PORTALS</h4>
            <ul className={styles.portalList}>
              <li>
                <button onClick={() => setActiveTab?.('clubs')} className={styles.portalBtn}>
                  <span className={styles.portalBullet}>•</span>
                  <span>Specialized Club Wings Directory</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab?.('gallery')} className={styles.portalBtn}>
                  <span className={styles.portalBullet}>•</span>
                  <span>Campus Media &amp; Photo Albums</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab?.('events')} className={styles.portalBtn}>
                  <span className={styles.portalBullet}>•</span>
                  <span>Intra Hackathon &amp; CTF Registrations</span>
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab?.('announcements')} className={styles.portalBtn}>
                  <span className={styles.portalBullet}>•</span>
                  <span>Circulars &amp; Official Notice Board</span>
                </button>
              </li>
              <li>
                <a
                  href="https://cityuniversity.ac.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.officialLink}
                  title="Visit City University Official Website"
                >
                  <span className={styles.portalBullet}>•</span>
                  <span>City University Official Website</span>
                  <ExternalLink style={{ width: '0.75rem', height: '0.75rem', color: '#a3a3a3' }} />
                </a>
              </li>
            </ul>

            <div className={styles.officeHours}>
              <p>Office Hours: Fri-Tue(09.00 AM-04.00 PM)</p>
              <p>Closed on Wed-Thu and University Holidays</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p>© 2026 City University Events &amp; Club (CUEC). No Rights is Reserved.</p>
          <p style={{ color: '#a3a3a3' }}>Credits goes to Md Arifuzzaman Abir</p>
        </div>
      </div>
    </footer>
  );
}
