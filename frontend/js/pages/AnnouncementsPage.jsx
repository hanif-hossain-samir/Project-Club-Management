import React, { useState, useEffect } from 'react';
import {
  Flame,
  FileText,
  Download,
  Pin,
  Search,
  Calendar,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  X,
  Bell
} from 'lucide-react';
import { useAuth } from '../auth.js';
import { api } from '../api.js';
import styles from './AnnouncementsPage.module.css';

export const AnnouncementsPage = ({
  announcements,
  selectedNotice,
  setSelectedNotice,
  onRefreshNotices
}) => {
  const { user } = useAuth();
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [clubFilter, setClubFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePriority, setNoticePriority] = useState('general');
  const [noticeCategory, setNoticeCategory] = useState('Official Notice');
  const [noticeWingSlug, setNoticeWingSlug] = useState('all');
  const [noticeImageUrl, setNoticeImageUrl] = useState('');
  const [noticeAttachmentName, setNoticeAttachmentName] = useState('');
  const [noticePinned, setNoticePinned] = useState(false);

  const [actionProcessing, setActionProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleOpenCreateNotice = () => {
    setEditingNoticeId(null);
    setNoticeTitle('');
    setNoticeContent('');
    setNoticePriority('general');
    setNoticeCategory('Official Notice');
    setNoticeWingSlug('all');
    setNoticeImageUrl('');
    setNoticeAttachmentName('');
    setNoticePinned(true);
    setNoticeModalOpen(true);
  };

  const handleOpenEditNotice = (item) => {
    setEditingNoticeId(item.id);
    setNoticeTitle(item.title);
    setNoticeContent(item.content);
    setNoticePriority(item.priority);
    setNoticeCategory(item.category);
    setNoticeWingSlug(item.wingSlug || 'all');
    setNoticeImageUrl(item.imageUrl || '');
    setNoticeAttachmentName(item.attachmentName || '');
    setNoticePinned(item.pinned);
    setNoticeModalOpen(true);
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      setErrorMessage('Notice title and content are required.');
      return;
    }

    setActionProcessing(true);
    setErrorMessage(null);

    const payload = {
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      priority: noticePriority,
      category: noticeCategory,
      wingSlug: noticeWingSlug,
      imageUrl: noticeImageUrl.trim() || undefined,
      attachmentName: noticeAttachmentName.trim() || undefined,
      pinned: noticePinned,
      clubId: 'computer_club'
    };

    try {
      if (editingNoticeId) {
        const res = await api.updateAnnouncement(editingNoticeId, payload, user?.id);
        if (res.success) {
          setSuccessMessage(
            noticePinned ? 'Notice updated and pinned to top banner!' : 'Notice updated successfully.'
          );
          if (onRefreshNotices) onRefreshNotices();
          setNoticeModalOpen(false);
        } else {
          setErrorMessage(res.message || 'Failed to update notice.');
        }
      } else {
        const res = await api.createAnnouncement(payload, user?.id);
        if (res.success) {
          setSuccessMessage(
            noticePinned
              ? 'New notice published & pinned to the top of the web!'
              : 'New notice published successfully.'
          );
          if (onRefreshNotices) onRefreshNotices();
          setNoticeModalOpen(false);
        } else {
          setErrorMessage(res.message || 'Failed to publish notice.');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Network error publishing notice.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleTogglePin = async (item) => {
    setActionProcessing(true);
    const newPinned = !item.pinned;
    try {
      const res = await api.updateAnnouncement(item.id, { pinned: newPinned }, user?.id);
      if (res.success) {
        setSuccessMessage(
          newPinned
            ? `Notice "${item.title}" pinned to official top ticker!`
            : 'Notice unpinned from top ticker.'
        );
        if (onRefreshNotices) onRefreshNotices();
      } else {
        setErrorMessage(res.message || 'Failed to toggle pin.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error updating pin.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleDeleteNotice = async (id, title) => {
    if (!window.confirm(`Delete notice "${title}"? This cannot be undone.`)) return;
    setActionProcessing(true);
    try {
      const res = await api.deleteAnnouncement(id, user?.id);
      if (res.success) {
        setSuccessMessage('Notice deleted successfully.');
        if (onRefreshNotices) onRefreshNotices();
      } else {
        setErrorMessage(res.message || 'Failed to delete notice.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error deleting notice.');
    } finally {
      setActionProcessing(false);
    }
  };

  useEffect(() => {
    if (selectedNotice) {
      setSearchQuery(selectedNotice.title);
      setSelectedNotice(null);
    }
  }, [selectedNotice, setSelectedNotice]);

  const filteredAnnouncements = announcements.filter((a) => {
    if (priorityFilter !== 'all' && a.priority !== priorityFilter) return false;
    if (clubFilter !== 'all' && a.clubId !== clubFilter && a.clubId !== 'all') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={styles.page}>
      {successMessage && (
        <div className="cuec-toast-success">
          <CheckCircle2 style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="cuec-toast-error">
          <AlertTriangle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <div className={styles.kicker}>Official University Circulars</div>
          <h1 className={styles.title}>CUEC Notice Board &amp; Press Releases</h1>
          <p className={styles.subtitle}>
            Official announcements issued by the Computer Club (CUCC) Controller. Pin urgent notices
            directly to the live marquee ticker at the top of the university website.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button type="button" onClick={handleOpenCreateNotice} className={styles.giveNoticeBtn}>
            <Plus style={{ width: '1rem', height: '1rem' }} />
            <span>Give Notice</span>
          </button>
        </div>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search circulars by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent Circulars</option>
              <option value="competition">🏆 Contests &amp; Auditions</option>
              <option value="important">⚠️ Important Notices</option>
              <option value="general">ℹ️ General Updates</option>
            </select>
          </div>

          <div>
            <select
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              className={styles.selectInput}
            >
              <option value="all">All Club Entities</option>
              <option value="computer_club">Computer Club (CUCC)</option>
              <option value="events_and_clubs">Events &amp; Clubs</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {filteredAnnouncements.map((item) => {
          const isUrgent = item.priority === 'urgent';
          const isCompetition = item.priority === 'competition';

          return (
            <div
              key={item.id}
              className={`${styles.noticeCard} ${item.pinned ? styles.noticeCardPinned : ''}`}
            >
              <div className={styles.noticeTop}>
                <div className={styles.badgeRow}>
                  {item.pinned && (
                    <span className={styles.pinnedBadge}>
                      <Pin style={{ width: '0.75rem', height: '0.75rem', fill: 'currentColor' }} />{' '}
                      Pinned
                    </span>
                  )}
                  {isUrgent && (
                    <span className={styles.urgentBadge}>
                      <Flame style={{ width: '0.75rem', height: '0.75rem', color: '#fcd34d' }} />{' '}
                      Urgent
                    </span>
                  )}
                  {isCompetition && <span className={styles.contestBadge}>Contest Alert</span>}
                  <span className={styles.categoryTag}>{item.category}</span>
                </div>

                <div className={styles.dateRef}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar style={{ width: '0.75rem', height: '0.75rem' }} />
                    {new Date(item.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span>Ref: #{item.id.toUpperCase()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 className={styles.noticeTitle}>{item.title}</h3>
                <p className={styles.noticeBody}>{item.content}</p>

                {item.imageUrl && (
                  <div className={styles.posterWrap}>
                    <img src={item.imageUrl} alt={item.title} className={styles.posterImg} />
                  </div>
                )}

                {item.attachmentName && (
                  <div className={styles.attachmentChip}>
                    <FileText style={{ width: '1rem', height: '1rem', color: '#dc2626' }} />
                    <span style={{ fontWeight: 600 }}>{item.attachmentName}</span>
                    <span style={{ fontSize: '10px', color: '#737373' }}>
                      (Official Circular PDF)
                    </span>
                    <Download style={{ width: '0.875rem', height: '0.875rem', marginLeft: '0.5rem', color: '#737373' }} />
                  </div>
                )}
              </div>

              <div className={styles.noticeFooter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className={styles.signatoryChip}>CU</div>
                  <span>
                    Signatory: <strong>{item.authorName}</strong> ({item.authorRole})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePin(item)}
                    disabled={actionProcessing}
                    className={`${styles.pinBtn} ${item.pinned ? styles.pinBtnActive : ''}`}
                    title={
                      item.pinned
                        ? 'Click to unpin from top notice ticker'
                        : 'Pin to official notice ticker at the top of the web'
                    }
                  >
                    <Pin
                      style={{
                        width: '0.875rem',
                        height: '0.875rem',
                        fill: item.pinned ? 'currentColor' : 'none',
                        color: item.pinned ? '#f59e0b' : 'inherit'
                      }}
                    />
                    <span>{item.pinned ? 'Pinned to Top' : 'Pin to Top Notice'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditNotice(item)}
                    className={styles.iconBtn}
                    title="Edit notice"
                  >
                    <Edit3 style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(item.id, item.title)}
                    className={styles.deleteBtn}
                    title="Delete notice"
                  >
                    <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {noticeModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setNoticeModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell style={{ width: '1.25rem', height: '1.25rem', color: '#fcd34d' }} />
                <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1.125rem' }}>
                  {editingNoticeId ? 'Edit Official Circular' : 'Give Official Notice'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setNoticeModalOpen(false)}
                style={{ color: '#ffffff', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className={styles.modalForm}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACM ICPC Regional Preliminary Team Registration Open"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="cuec-input"
                />
              </div>

              <div className={styles.filterGrid}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Category
                  </label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                    className="cuec-select"
                  >
                    <option value="Official Notice">Official Notice</option>
                    <option value="Urgent Alert">Urgent Alert</option>
                    <option value="Competition">Competition &amp; Hackathon</option>
                    <option value="Workshop">Workshop &amp; Bootcamp</option>
                    <option value="Meeting Routine">Meeting Routine</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Priority
                  </label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value)}
                    className="cuec-select"
                  >
                    <option value="urgent">🔴 Urgent</option>
                    <option value="important">⚠️ Important</option>
                    <option value="competition">🏆 Competition</option>
                    <option value="general">ℹ️ General</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Target Wing
                  </label>
                  <select
                    value={noticeWingSlug}
                    onChange={(e) => setNoticeWingSlug(e.target.value)}
                    className="cuec-select"
                  >
                    <option value="all">All Wings (CUCC)</option>
                    <option value="programming">Programming Club</option>
                    <option value="cyber_security">Cyber Security Wing</option>
                    <option value="research">Research &amp; Innovation Wing</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Notice Content &amp; Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide comprehensive details, rules, eligibility, venue, date, and contact instructions..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="cuec-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Image Banner URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={noticeImageUrl}
                    onChange={(e) => setNoticeImageUrl(e.target.value)}
                    className="cuec-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Circular PDF Attachment Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CUEC_Notice_Vol42_2026.pdf"
                    value={noticeAttachmentName}
                    onChange={(e) => setNoticeAttachmentName(e.target.value)}
                    className="cuec-input"
                  />
                </div>
              </div>

              <div className={styles.pinToggleBox}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#D40000'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={noticePinned}
                    onChange={(e) => setNoticePinned(e.target.checked)}
                    style={{ width: '1rem', height: '1rem', accentColor: '#D40000', cursor: 'pointer' }}
                  />
                  <Pin style={{ width: '1rem', height: '1rem', fill: 'currentColor', color: '#D40000' }} />
                  <span>Pin notice to the official notice in the top of the web</span>
                </label>
                <p style={{ fontSize: '11px', color: '#737373', paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  When checked, this notice will immediately appear in the marquee ticker at the top
                  of the web page for maximum campus visibility.
                </p>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setNoticeModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={actionProcessing} className={styles.saveBtn}>
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                  <span>{editingNoticeId ? 'Save Changes' : 'Publish Notice'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
