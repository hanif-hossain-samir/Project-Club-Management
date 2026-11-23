import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Search, CalendarDays, LayoutGrid, Info } from 'lucide-react';
import styles from './EventsPage.module.css';

export const EventsPage = ({
  events,
  selectedEventForModal,
  setSelectedEventForModal
}) => {
  const [selectedWing, setSelectedWing] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    if (selectedEventForModal) {
      setSelectedEvent(selectedEventForModal);
      setAboutModalOpen(true);
      setSelectedEventForModal(null);
    }
  }, [selectedEventForModal, setSelectedEventForModal]);

  const filteredEvents = events.filter((evt) => {
    if (evt.clubId !== 'computer_club') return false;
    if (selectedWing !== 'all' && evt.wingSlug !== selectedWing) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        evt.venue.toLowerCase().includes(q) ||
        (evt.tags || []).some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAbout = (evt) => {
    setSelectedEvent(evt);
    setAboutModalOpen(true);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <div className={styles.kicker}>CUCC Events &amp; Competitions</div>
          <h1 className={styles.title}>Upcoming Hackathons, CTF Drills &amp; Tech Sessions</h1>
          <p className={styles.subtitle}>
            Official technology events, coding marathons, cyber security battlegrounds, and
            scientific colloquiums under Computer Club (CUCC).
          </p>
        </div>

        <div className={styles.viewSwitcher}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
          >
            <LayoutGrid style={{ width: '0.875rem', height: '0.875rem' }} />
            <span>Card Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`${styles.viewBtn} ${viewMode === 'calendar' ? styles.viewBtnActive : ''}`}
          >
            <CalendarDays style={{ width: '0.875rem', height: '0.875rem' }} />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search CUCC event, topic, venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.lockedClub}>
            <span>Computer Club (CUCC)</span>
          </div>

          <div>
            <select
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
              className={styles.wingSelect}
            >
              <option value="all">All CUCC Wings (3 Wings)</option>
              <option value="programming">Programming Club</option>
              <option value="cyber_security">Cyber Security Club</option>
              <option value="research">Research Club</option>
            </select>
          </div>

          <div className={styles.resetWrap}>
            <button
              type="button"
              onClick={() => {
                setSelectedWing('all');
                setSearchQuery('');
              }}
              className={styles.resetBtn}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className={styles.grid}>
          {filteredEvents.map((evt) => (
            <div key={evt.id} className={styles.eventCard}>
              <div>
                <div className={styles.bannerWrap}>
                  <img src={evt.bannerUrl} alt={evt.title} className={styles.bannerImg} />
                  <div className={styles.bannerScrim} />

                  <div className={styles.bannerBadges}>
                    <span className={styles.kickerTag}>{evt.kicker || evt.category}</span>
                    {evt.isFeatured && <span className={styles.featuredTag}>Featured</span>}
                  </div>

                  <div className={styles.bannerBottom}>
                    <div className={styles.bannerDateRow}>
                      <span className={styles.dateSpan}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem' }} /> {evt.date}
                      </span>
                      <span style={{ color: '#d4d4d4', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                        {evt.time}
                      </span>
                    </div>
                    <h3 className={styles.cardTitle}>{evt.title}</h3>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.cardDesc}>{evt.description}</p>

                  <div className={styles.metaRows}>
                    <p className={styles.metaItem}>
                      <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#D40000', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evt.venue}
                      </span>
                    </p>
                    <p className={styles.metaItem}>
                      <Clock style={{ width: '0.875rem', height: '0.875rem', color: '#a3a3a3', flexShrink: 0 }} />
                      <span>Deadline: {evt.registrationDeadline}</span>
                    </p>
                  </div>

                  <div className={styles.tagsRow}>
                    {(evt.tags || []).map((tag, idx) => (
                      <span key={idx} className={styles.tagPill}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className={styles.seatRow}>
                    <span style={{ color: '#737373', fontWeight: 500 }}>
                      Stacked Applications:{' '}
                      <strong style={{ fontFamily: 'var(--font-mono)' }}>{evt.registeredCount}</strong>
                    </span>
                    <span className={styles.unlimitedBadge}>Unlimited Seats · No Limit</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="button"
                  onClick={() => handleOpenAbout(evt)}
                  className={styles.aboutBtn}
                >
                  <Info style={{ width: '1rem', height: '1rem' }} />
                  <span>About this event</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div className={styles.calendarBox}>
          <div className={styles.calendarTop}>
            <h3 style={{ fontWeight: 700, fontSize: '1.125rem', fontFamily: 'var(--font-heading)' }}>
              CUCC Academic Trimester Schedule
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#737373', fontFamily: 'var(--font-mono)' }}>
              Computer Club (CUCC) · All 3 Wings
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEvents.map((evt) => (
              <div key={evt.id} className={styles.calendarRow}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className={styles.calDateBox}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, marginTop: '0.125rem' }}>
                      {new Date(evt.date).getDate()}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={styles.tagPill} style={{ backgroundColor: '#fee2e2', color: '#D40000', fontWeight: 700 }}>
                        {evt.wingSlug.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#737373' }}>{evt.time}</span>
                    </div>

                    <h4 style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.25rem' }}>
                      {evt.title}
                    </h4>

                    <p style={{ fontSize: '0.75rem', color: '#737373', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                      <MapPin style={{ width: '0.875rem', height: '0.875rem', color: '#dc2626' }} />
                      <span>{evt.venue}</span>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenAbout(evt)}
                    className={styles.calActionBtn}
                  >
                    <Info style={{ width: '0.875rem', height: '0.875rem' }} />
                    <span>About this event</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aboutModalOpen && selectedEvent && (
        <div className={styles.modalBackdrop} onClick={() => setAboutModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#fbbf24', color: '#450a0a', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedEvent.category}
                </span>
                <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.25rem', backgroundColor: 'rgba(0,0,0,0.4)', color: '#e5e5e5', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedEvent.wingSlug.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
                {selectedEvent.title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#fecaca', marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                <span>
                  <Calendar style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.25rem' }} />
                  {selectedEvent.date}
                </span>
                <span>
                  <Clock style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.25rem' }} />
                  {selectedEvent.time}
                </span>
                <span>
                  <MapPin style={{ width: '0.875rem', height: '0.875rem', display: 'inline', marginRight: '0.25rem' }} />
                  {selectedEvent.venue}
                </span>
              </p>
            </div>

            <div className={styles.modalBody}>
              <div>
                <span style={{ fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                  About This Event &amp; Syllabus
                </span>
                <p className={styles.detailBox}>
                  {selectedEvent.fullDetails || selectedEvent.description}
                </p>
              </div>

              {selectedEvent.chiefGuests && selectedEvent.chiefGuests.length > 0 && (
                <div>
                  <span style={{ fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
                    Special Guests &amp; Mentors
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {selectedEvent.chiefGuests.map((guest, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '0.5rem',
                          backgroundColor: '#fef2f2',
                          color: '#D40000',
                          fontWeight: 600,
                          border: '1px solid #fecaca'
                        }}
                      >
                        {guest}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.logisticsGrid}>
                <div className={styles.logisticsCell}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#a3a3a3', display: 'block' }}>
                    Registration Policy
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                    Open Access · Unlimited Seats
                  </span>
                </div>
                <div className={styles.logisticsCell}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#a3a3a3', display: 'block' }}>
                    Registered Attendees
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {selectedEvent.registeredCount} Students Enrolled
                  </span>
                </div>
              </div>

              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#a3a3a3', display: 'block', marginBottom: '0.25rem' }}>
                    Focus Topics
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {selectedEvent.tags.map((tag, idx) => (
                      <span key={idx} className={styles.tagPill}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                onClick={() => setAboutModalOpen(false)}
                className={styles.modalCloseBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
