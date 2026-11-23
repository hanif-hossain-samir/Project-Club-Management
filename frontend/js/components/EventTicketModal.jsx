import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Printer, X } from 'lucide-react';
import styles from './EventTicketModal.module.css';

export const EventTicketModal = ({ event, registration, onClose }) => {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className={styles.closeBtn}>
          <X style={{ width: '1rem', height: '1rem' }} />
        </button>

        <div className={styles.header}>
          <div className={styles.logoCenter}>
            <div className={styles.logoBox}>
              <img
                src="/city-university-logo.jpg"
                alt="City University Official Logo"
                className={styles.logoImg}
              />
            </div>
          </div>
          <div className={styles.confirmBadge}>
            <CheckCircle style={{ width: '0.875rem', height: '0.875rem' }} /> Registration Confirmed
          </div>
          <h3 className={styles.title}>{event.title}</h3>
          <p className={styles.subtitle}>Official City University Event Delegate Pass</p>
        </div>

        <div className={styles.body}>
          <div className={styles.passBanner}>
            <div>
              <span className={styles.metaLabel}>Digital Pass Code</span>
              <p className={styles.ticketCode}>{registration.ticketCode}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={styles.metaLabel}>Seat Status</span>
              <p className={styles.seatStatus}>Reserved &amp; Confirmed</p>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Attendee Name</span>
              <span className={styles.cellValue}>{registration.userName}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Student ID</span>
              <span className={styles.cellValue}>{registration.studentId}</span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Event Date</span>
              <span className={styles.cellValue}>
                <Calendar className={styles.iconRed} style={{ width: '0.75rem', height: '0.75rem' }} />
                {event.date}
              </span>
            </div>
            <div className={styles.cell}>
              <span className={styles.cellLabel}>Time</span>
              <span className={styles.cellValue}>
                <Clock className={styles.iconRed} style={{ width: '0.75rem', height: '0.75rem' }} />
                {event.time}
              </span>
            </div>
          </div>

          <div className={styles.cell} style={{ fontSize: '0.75rem' }}>
            <span className={styles.cellLabel}>Venue</span>
            <span className={styles.cellValue} style={{ gap: '0.375rem' }}>
              <MapPin className={styles.iconRed} style={{ width: '0.875rem', height: '0.875rem' }} />
              {event.venue}
            </span>
          </div>

          <p className={styles.noteText}>
            Please present this digital pass or student ID card at the entry gate check-in desk.
          </p>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={() => window.print()} className={styles.printBtn}>
            <Printer style={{ width: '0.875rem', height: '0.875rem' }} />
            Print Pass
          </button>
          <button type="button" onClick={onClose} className={styles.doneBtn}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
