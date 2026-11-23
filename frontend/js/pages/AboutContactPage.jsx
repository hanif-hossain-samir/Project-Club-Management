import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  HeartHandshake,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import styles from './AboutContactPage.module.css';

export const AboutContactPage = () => {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitInquiry = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setInquiryMessage('');
    setInquirySubject('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <a
          href="https://cityuniversity.ac.bd/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.sealLink}
          title="Click to visit City University official website: https://cityuniversity.ac.bd/"
        >
          <img
            src="/city-university-logo.jpg"
            alt="City University Official Logo"
            className={styles.sealImg}
          />
        </a>
        <div className={styles.kickerPill}>
          <a
            href="https://cityuniversity.ac.bd/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
            title="Visit cityuniversity.ac.bd"
          >
            <span>University Directorate of Student Welfare</span>
            <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
          </a>
        </div>
        <h1 className={styles.title}>About CUEC &amp; Campus Contacts</h1>
        <p className={styles.subtitle}>
          City University Events &amp; Club (CUEC) is the central governing body fostering
          technological innovation, competitive sportsmanship, and performing arts.
        </p>
      </div>

      <div className={styles.visionGrid}>
        <div className={styles.visionCard}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#fee2e2', color: '#D40000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award style={{ width: '1.25rem', height: '1.25rem' }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
            Our Central Mission
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.625 }}>
            To coordinate all student extracurricular endeavors under an accountable, transparent
            administrative framework that elevates City University on national and global stages.
          </p>
        </div>

        <div className={styles.visionCard}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers style={{ width: '1.25rem', height: '1.25rem' }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
            Scalable 3-Tier Governance
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.625 }}>
            Governed by Administrators (Faculty &amp; DSW), managed by Student Controllers (Wing
            Leads), and actively energized by thousands of registered Student Members.
          </p>
        </div>

        <div className={styles.visionCard}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#fee2e2', color: '#D40000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeartHandshake style={{ width: '1.25rem', height: '1.25rem' }} />
          </div>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>
            Future Club Expansion
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.625 }}>
            Architected to support future chapters including Robotics &amp; IoT, Debating Society,
            Entrepreneurship Cell, and Environmental Green Club seamlessly.
          </p>
        </div>
      </div>

      <div className={styles.contactLayout}>
        <div className={styles.leftCol}>
          <div className={styles.visionCard} style={{ padding: '1.75rem', gap: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
              Central Directorate Office
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <MapPin style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <span style={{ fontWeight: 700, display: 'block' }}>
                    City University Permanent Campus
                  </span>
                  <p style={{ color: '#737373', marginTop: '0.125rem' }}>
                    Room 204, Directorate of Student Welfare, Khagan, Birulia, Savar, Dhaka-1216
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Clock style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <span style={{ fontWeight: 700, display: 'block' }}>Office Working Hours</span>
                  <p style={{ color: '#737373', marginTop: '0.125rem' }}>
                    Fri–Tue: 09:00 AM – 04:00 PM (Closed on Wed–Thu and University Holidays)
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Phone style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <span style={{ fontWeight: 700, display: 'block' }}>
                    Direct Telephones &amp; Extensions
                  </span>
                  <p style={{ color: '#737373', marginTop: '0.125rem' }}>
                    Central Exchange: +880 2-9876543 (Ext. 201 for CUCC, Ext. 305 for CUEC)
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Mail style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <span style={{ fontWeight: 700, display: 'block' }}>Official University Emails</span>
                  <p style={{ color: '#737373', marginTop: '0.125rem' }}>
                    dsw@cityuniversity.edu • cuec@cityuniversity.edu
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.faqCard}>
            <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HelpCircle style={{ width: '1rem', height: '1rem', color: '#D40000' }} />
              Frequently Asked Questions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <details>
                <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                  How can I join the Computer Club or Specialized Wings?
                </summary>
                <p style={{ color: '#737373', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid #ef4444' }}>
                  Submit an application for Programming, Cyber Security, or Research wings and visit
                  weekly sessions at Lab 402.
                </p>
              </details>

              <details>
                <summary style={{ fontWeight: 600, cursor: 'pointer' }}>
                  Who approves CUCC Wing applications?
                </summary>
                <p style={{ color: '#737373', marginTop: '0.25rem', paddingLeft: '0.5rem', borderLeft: '2px solid #ef4444' }}>
                  Membership applications across all 3 wings are reviewed and approved directly by the
                  CUCC Controller.
                </p>
              </details>
            </div>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
              Submit Inquiries or Club Proposals
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.125rem' }}>
              Have an idea for a new workshop, hackathon topic, or partnership? Contact our central
              team.
            </p>
          </div>

          {submitted ? (
            <div style={{ padding: '1.5rem', borderRadius: '1rem', backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem', color: '#059669', margin: '0 auto' }} />
              <h4 style={{ fontWeight: 700, color: '#065f46', fontSize: '0.875rem' }}>
                Inquiry Transmitted Successfully
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#047857', maxWidth: '24rem', margin: '0 auto' }}>
                Thank you for contacting CUEC. A club representative will follow up via your
                university email within 24–48 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#065f46', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="cuec-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    University / Personal Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="tanvir@cityuniversity.edu"
                    className="cuec-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  placeholder="e.g. Proposal for Intra Hackathon sponsorship or membership inquiry"
                  className="cuec-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Message Details *
                </label>
                <textarea
                  rows={5}
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Please describe your question or proposal..."
                  className="cuec-textarea"
                />
              </div>

              <button
                type="submit"
                className="cuec-btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontSize: '0.75rem' }}
              >
                <Send style={{ width: '1rem', height: '1rem' }} />
                <span>Submit Inquiry to Directorate</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
