import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Layers,
  Calendar,
  Bell,
  ArrowRight,
  Code2,
  UserCheck,
  LayoutDashboard,
  Image as ImageIcon
} from 'lucide-react';
import styles from './SearchModal.module.css';

export const SearchModal = ({
  isOpen,
  onClose,
  clubs,
  events,
  announcements,
  setActiveTab,
  onSelectEvent,
  onSelectWing,
  onSelectAnnouncement
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  const cuccClub = clubs.find((c) => c.id === 'computer_club') || clubs[0];
  const cuccWings = cuccClub
    ? cuccClub.wings.filter(
        (w) => w.slug === 'programming' || w.slug === 'cyber_security' || w.slug === 'research'
      )
    : [];

  const matchedWings = cleanQuery
    ? cuccWings.filter(
        (w) =>
          w.name.toLowerCase().includes(cleanQuery) ||
          w.shortDesc.toLowerCase().includes(cleanQuery) ||
          w.slug.toLowerCase().includes(cleanQuery)
      )
    : cuccWings;

  const cuccEvents = events.filter((e) => e.clubId === 'computer_club');
  const matchedEvents = cleanQuery
    ? cuccEvents.filter(
        (e) =>
          e.title.toLowerCase().includes(cleanQuery) ||
          e.description.toLowerCase().includes(cleanQuery) ||
          e.venue.toLowerCase().includes(cleanQuery) ||
          e.wingSlug.toLowerCase().includes(cleanQuery)
      )
    : cuccEvents.slice(0, 3);

  const cuccNotices = announcements.filter((a) => a.clubId === 'computer_club');
  const matchedNotices = cleanQuery
    ? cuccNotices.filter(
        (a) =>
          a.title.toLowerCase().includes(cleanQuery) ||
          a.content.toLowerCase().includes(cleanQuery) ||
          a.category.toLowerCase().includes(cleanQuery)
      )
    : cuccNotices.slice(0, 3);

  const controllerTools = [
    {
      title: 'Member Approvals (All Wings)',
      desc: 'Review and approve pending student applications across all 3 CUCC wings',
      action: () => {
        setActiveTab('clubs');
        onClose();
      },
      icon: <UserCheck style={{ width: '1rem', height: '1rem' }} />
    },
    {
      title: 'Controller Command Dashboard',
      desc: 'Access event creation, photo archive curation, and roster management',
      action: () => {
        setActiveTab('dashboard');
        onClose();
      },
      icon: <LayoutDashboard style={{ width: '1rem', height: '1rem' }} />
    },
    {
      title: 'CUCC Event Directory',
      desc: 'Inspect hackathons, CTF drills, and workshops for CUCC students',
      action: () => {
        setActiveTab('events');
        onClose();
      },
      icon: <Calendar style={{ width: '1rem', height: '1rem' }} />
    },
    {
      title: 'CUCC Photo Archives',
      desc: 'High-resolution photo albums for Programming, Cyber Security, and Research',
      action: () => {
        setActiveTab('gallery');
        onClose();
      },
      icon: <ImageIcon style={{ width: '1rem', height: '1rem' }} />
    }
  ];

  const matchedTools = cleanQuery
    ? controllerTools.filter(
        (t) =>
          t.title.toLowerCase().includes(cleanQuery) || t.desc.toLowerCase().includes(cleanQuery)
      )
    : controllerTools.slice(0, 2);

  const totalResults =
    matchedWings.length + matchedEvents.length + matchedNotices.length + matchedTools.length;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchBar}>
          <div className={styles.logoWrap}>
            <img
              src="/city-university-logo.jpg"
              alt="City University Official Logo"
              className={styles.logoImg}
            />
          </div>
          <Search className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search CUCC wings, events, notices, member approvals..."
            className={styles.input}
          />
          {query && (
            <button onClick={() => setQuery('')} className={styles.clearBtn} type="button">
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          )}
          <span className={styles.escBadge}>ESC</span>
          <button onClick={onClose} className={styles.closeBtn} type="button">
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>

        <div className={styles.chipsBar}>
          <span className={styles.chipsLabel}>CUCC Quick:</span>
          {[
            'Programming Wing',
            'Cyber Security',
            'Research Wing',
            'Member Approvals',
            'Hackathons',
            'Notices'
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setQuery(tag)}
              className={styles.chipBtn}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className={styles.resultsBody}>
          {totalResults === 0 && (
            <div className={styles.emptyState}>
              <Search className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No results found for "{query}"</p>
              <p className={styles.emptyDesc}>
                Try searching for "Programming", "Cyber Security", "Research", or "Member
                Approvals".
              </p>
            </div>
          )}

          {matchedTools.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>
                  <UserCheck style={{ width: '0.875rem', height: '0.875rem' }} />
                  Controller Commands ({matchedTools.length})
                </span>
                <span>CUCC Management</span>
              </div>
              <div className={styles.twoColGrid}>
                {matchedTools.map((tool, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={tool.action}
                    className={styles.cardBtn}
                  >
                    <div className={styles.cardIconBox}>{tool.icon}</div>
                    <div className={styles.cardTextWrap}>
                      <div className={styles.cardTitle}>{tool.title}</div>
                      <div className={styles.cardDesc}>{tool.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedWings.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>
                  <Layers style={{ width: '0.875rem', height: '0.875rem' }} />
                  CUCC Wings ({matchedWings.length})
                </span>
                <span>Specialized Divisions</span>
              </div>
              <div className={styles.twoColGrid}>
                {matchedWings.map((wing) => (
                  <button
                    key={wing.id}
                    type="button"
                    onClick={() => {
                      onSelectWing(wing);
                      onClose();
                    }}
                    className={styles.cardBtn}
                  >
                    <div className={styles.cardIconBox}>
                      <Code2 style={{ width: '1rem', height: '1rem' }} />
                    </div>
                    <div className={styles.cardTextWrap}>
                      <div className={styles.cardTitle}>{wing.name}</div>
                      <div className={styles.cardDesc}>{wing.shortDesc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedEvents.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>
                  <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                  CUCC Events &amp; Contests ({matchedEvents.length})
                </span>
                <span>Events Schedule</span>
              </div>
              <div className={styles.listStack}>
                {matchedEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => {
                      onSelectEvent(evt);
                      onClose();
                    }}
                    className={styles.rowBtn}
                  >
                    <div style={{ minWidth: 0 }}>
                      <span className={styles.rowMeta}>
                        {evt.date} • {evt.venue}
                      </span>
                      <h4 className={styles.rowTitle}>{evt.title}</h4>
                    </div>
                    <span className={styles.viewTag}>View Event</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedNotices.length > 0 && (
            <div className={styles.groupSection}>
              <div className={styles.groupHeader}>
                <span className={styles.groupTitle}>
                  <Bell style={{ width: '0.875rem', height: '0.875rem' }} />
                  CUCC Notices &amp; Circulars ({matchedNotices.length})
                </span>
                <span>Official Circulars</span>
              </div>
              <div className={styles.listStack}>
                {matchedNotices.map((ann) => (
                  <button
                    key={ann.id}
                    type="button"
                    onClick={() => {
                      onSelectAnnouncement(ann);
                      onClose();
                    }}
                    className={styles.rowBtn}
                  >
                    <div style={{ minWidth: 0 }}>
                      <span className={styles.noticeMeta}>
                        {ann.publishedAt} • Circular #{ann.id.slice(-4).toUpperCase()}
                      </span>
                      <h4 className={styles.rowTitle}>{ann.title}</h4>
                    </div>
                    <ArrowRight className={styles.arrowIcon} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span>Computer Club (CUCC) • Controller Command Hub</span>
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard');
              onClose();
            }}
            className={styles.footerLink}
          >
            Dashboard (CC) &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
