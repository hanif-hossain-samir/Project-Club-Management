import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  Image as ImageIcon,
  Users,
  Check,
  X,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  LayoutDashboard,
  UserMinus
} from 'lucide-react';
import { useAuth } from '../auth.js';
import { api } from '../api.js';
import { INITIAL_MEMBER_REQUESTS } from '../seedDefaults.js';
import styles from './AdminDashboard.module.css';

const CUCC_WINGS = [
  { slug: 'programming', label: 'Programming Club' },
  { slug: 'cyber_security', label: 'Cyber Security Wing' },
  { slug: 'research', label: 'Research & Innovation Wing' }
];

export const AdminDashboard = ({ events, gallery, onRefreshData }) => {
  const { user } = useAuth();
  const controllerClubId = 'computer_club';
  const activeWings = CUCC_WINGS;

  const [currentTab, setCurrentTab] = useState('overview');
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

  // Members state
  const [clubMembersList, setClubMembersList] = useState([]);
  const [memberRequests, setMemberRequests] = useState(INITIAL_MEMBER_REQUESTS);
  const [memberSubTab, setMemberSubTab] = useState('approvals');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberWingFilter, setMemberWingFilter] = useState('all');

  const fetchClubMembers = async () => {
    try {
      const res = await api.getMembers(controllerClubId, user?.id);
      if (res.success && res.members) {
        setClubMembersList(res.members);
      }
    } catch {
      // keep existing
    }
  };

  const fetchMemberRequests = async () => {
    try {
      const res = await api.getMemberRequests(user?.id);
      if (res.success && res.requests) {
        setMemberRequests(res.requests);
      }
    } catch {
      // keep existing
    }
  };

  useEffect(() => {
    fetchClubMembers();
    fetchMemberRequests();
  }, [user]);

  const handleApproveApplicant = async (req) => {
    setActionProcessing(true);
    try {
      const res = await api.approveMemberRequest(req.id, user?.id);
      if (res.success) {
        setSuccessMessage(
          `Approved ${req.name} (${req.studentId}) for ${req.wingSlug.replace('_', ' ').toUpperCase()}!`
        );
        setMemberRequests((prev) =>
          prev.map((m) => (m.id === req.id ? { ...m, status: 'approved' } : m))
        );
        fetchClubMembers();
        onRefreshData();
      } else {
        setErrorMessage(res.message || 'Failed to approve applicant.');
      }
    } catch (e) {
      setErrorMessage(e.message || 'Error approving applicant.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRejectApplicant = async (req) => {
    if (!window.confirm(`Decline membership application for "${req.name}"?`)) return;
    setActionProcessing(true);
    try {
      const res = await api.rejectMemberRequest(req.id, user?.id);
      if (res.success) {
        setSuccessMessage(`Application for ${req.name} declined.`);
        setMemberRequests((prev) =>
          prev.map((m) => (m.id === req.id ? { ...m, status: 'rejected' } : m))
        );
      } else {
        setErrorMessage(res.message || 'Failed to decline applicant.');
      }
    } catch (e) {
      setErrorMessage(e.message || 'Error declining applicant.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleApproveAllPending = async () => {
    const pendingApplicants = memberRequests.filter(
      (r) => r.clubId === 'computer_club' && r.status === 'pending'
    );
    if (pendingApplicants.length === 0) return;
    if (
      !window.confirm(`Approve all ${pendingApplicants.length} pending applicants across all wings?`)
    ) {
      return;
    }

    setActionProcessing(true);
    try {
      let count = 0;
      for (const req of pendingApplicants) {
        const res = await api.approveMemberRequest(req.id, user?.id);
        if (res.success) count++;
      }
      setMemberRequests((prev) =>
        prev.map((item) =>
          item.clubId === 'computer_club' && item.status === 'pending'
            ? { ...item, status: 'approved' }
            : item
        )
      );
      setSuccessMessage(`Approved ${count} students across all CUCC wings!`);
      fetchClubMembers();
      onRefreshData();
    } catch (e) {
      setErrorMessage(e.message || 'Batch approval failed.');
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRemoveMember = async (memberUser) => {
    if (
      !window.confirm(
        `Revoke Computer Club (CUCC) membership for "${memberUser.name}" (${memberUser.studentId})? Their user account will be preserved, but their assigned wing and club membership will be removed.`
      )
    ) {
      return;
    }

    setActionProcessing(true);
    try {
      const res = await api.removeMember(memberUser.id, user?.id);
      if (res.success) {
        setSuccessMessage(`Member "${memberUser.name}" removed from Computer Club.`);
        fetchClubMembers();
        onRefreshData();
      } else {
        setErrorMessage(res.message || 'Failed to remove member.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error removing member.');
    } finally {
      setActionProcessing(false);
    }
  };

  // Gallery state
  const [galModalOpen, setGalModalOpen] = useState(false);
  const [editingGalId, setEditingGalId] = useState(null);
  const [galTitle, setGalTitle] = useState('');
  const [galImageUrl, setGalImageUrl] = useState('');
  const [galBatchUrls, setGalBatchUrls] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [galWingSlug, setGalWingSlug] = useState('programming');
  const [galEventName, setGalEventName] = useState('');
  const [galCaption, setGalCaption] = useState('');
  const [galWingFilter, setGalWingFilter] = useState('all');

  const handleOpenCreateGal = () => {
    setEditingGalId(null);
    setGalTitle('');
    setGalImageUrl('');
    setGalBatchUrls('');
    setIsBatchMode(false);
    setGalWingSlug('programming');
    setGalEventName('Programming Contest 2026');
    setGalCaption('');
    setGalModalOpen(true);
  };

  const handleOpenEditGal = (item) => {
    setEditingGalId(item.id);
    setGalTitle(item.title);
    setGalImageUrl(item.imageUrl);
    setIsBatchMode(false);
    setGalWingSlug(item.wingSlug);
    setGalEventName(item.eventName || '');
    setGalCaption(item.caption || '');
    setGalModalOpen(true);
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    setActionProcessing(true);

    try {
      if (editingGalId) {
        const res = await api.updateGalleryItem(
          editingGalId,
          {
            title: galTitle.trim(),
            imageUrl: galImageUrl.trim(),
            clubId: controllerClubId,
            wingSlug: galWingSlug,
            eventName: galEventName.trim() || undefined,
            caption: galCaption.trim() || undefined
          },
          user?.id
        );
        if (res.success) setSuccessMessage('Photo updated successfully.');
        else setErrorMessage(res.message || 'Failed to update photo.');
      } else if (isBatchMode) {
        const urls = galBatchUrls
          .split('\n')
          .map((u) => u.trim())
          .filter((u) => u.length > 5);

        if (urls.length === 0) {
          setErrorMessage('Please provide at least one valid image URL.');
          setActionProcessing(false);
          return;
        }

        const res = await api.createGalleryItem(
          {
            title: galTitle.trim() || 'CUCC Archive',
            clubId: controllerClubId,
            wingSlug: galWingSlug,
            eventName: galEventName.trim() || 'CUCC Archive',
            caption: galCaption.trim() || undefined,
            imageUrls: urls
          },
          user?.id
        );

        if (res.success) {
          setSuccessMessage(`${urls.length} photos added to the ${galWingSlug.replace('_', ' ')} album.`);
        } else {
          setErrorMessage(res.message || 'Batch upload failed.');
        }
      } else {
        const res = await api.createGalleryItem(
          {
            title: galTitle.trim() || 'CUCC Wing Photo',
            imageUrl: galImageUrl.trim(),
            clubId: controllerClubId,
            wingSlug: galWingSlug,
            eventName: galEventName.trim() || undefined,
            caption: galCaption.trim() || undefined
          },
          user?.id
        );
        if (res.success) setSuccessMessage('Photo added to CUCC wing gallery.');
        else setErrorMessage(res.message || 'Failed to add photo.');
      }
      setActionProcessing(false);
      setGalModalOpen(false);
      onRefreshData();
    } catch (e) {
      setActionProcessing(false);
      setErrorMessage(e.message || 'Network error.');
    }
  };

  const handleDeleteGalleryItem = async (id, title) => {
    if (!window.confirm(`Delete photo: "${title}" from the gallery?`)) return;
    try {
      const res = await api.deleteGalleryItem(id, user?.id);
      if (res.success) {
        setSuccessMessage('Photo removed from gallery.');
        onRefreshData();
      } else {
        setErrorMessage(res.message || 'Failed to delete photo.');
      }
    } catch (e) {
      setErrorMessage(e.message || 'Network error.');
    }
  };

  // Events state
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventWingSlug, setEventWingSlug] = useState('programming');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventVenue, setEventVenue] = useState('Software Lab 402, Campus');
  const [eventDesc, setEventDesc] = useState('');
  const [eventBanner, setEventBanner] = useState('');
  const [eventCapacity, setEventCapacity] = useState('100');
  const [attendeeRosterEvent, setAttendeeRosterEvent] = useState(null);

  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventWingSlug('programming');
    setEventDate(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
    setEventTime('10:00 AM');
    setEventVenue('Software Lab 402, City University Campus');
    setEventDesc('');
    setEventBanner(
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80'
    );
    setEventCapacity('100');
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt) => {
    setEditingEventId(evt.id);
    setEventTitle(evt.title);
    setEventWingSlug(evt.wingSlug);
    setEventDate(evt.date);
    setEventTime(evt.time);
    setEventVenue(evt.venue);
    setEventDesc(evt.description);
    setEventBanner(evt.bannerUrl || '');
    setEventCapacity(String(evt.capacity || 100));
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setActionProcessing(true);

    const payload = {
      title: eventTitle.trim(),
      clubId: controllerClubId,
      wingSlug: eventWingSlug,
      date: eventDate,
      time: eventTime,
      venue: eventVenue.trim(),
      description: eventDesc.trim(),
      bannerUrl: eventBanner.trim() || undefined,
      capacity: parseInt(eventCapacity, 10) || 100,
      isFeatured: true,
      registrationOpen: true
    };

    try {
      if (editingEventId) {
        const res = await api.updateEvent(editingEventId, payload, user?.id);
        if (res.success) setSuccessMessage('CUCC event updated successfully.');
        else setErrorMessage(res.message || 'Failed to update event.');
      } else {
        const res = await api.createEvent(payload, user?.id);
        if (res.success) setSuccessMessage('New CUCC event published successfully.');
        else setErrorMessage(res.message || 'Failed to create event.');
      }
      setActionProcessing(false);
      setEventModalOpen(false);
      onRefreshData();
    } catch (e) {
      setActionProcessing(false);
      setErrorMessage(e.message || 'Network error.');
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"? This cannot be undone.`)) return;
    try {
      const res = await api.deleteEvent(id, user?.id);
      if (res.success) {
        setSuccessMessage('Event deleted successfully.');
        onRefreshData();
      } else {
        setErrorMessage(res.message || 'Failed to delete event.');
      }
    } catch (e) {
      setErrorMessage(e.message || 'Network error.');
    }
  };

  const visibleEvents = events.filter((e) => e.clubId === controllerClubId);
  const visibleGallery = gallery.filter((g) => g.clubId === controllerClubId);

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

      <div className={styles.heroBanner}>
        <div className={styles.bannerLeft}>
          <div className={styles.logoBox}>
            <img
              src="/city-university-logo.jpg"
              alt="City University Official Logo"
              className={styles.logoImg}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={styles.authorityBadge}>
                <UserCheck style={{ width: '0.875rem', height: '0.875rem' }} /> CUCC Controller
                Authority • 3 Wings
              </span>
            </div>

            <h1 className={styles.bannerTitle}>Computer Club (CUCC) Controller Dashboard</h1>

            <p className={styles.bannerSub}>
              Official command hub for City University Computer Club. Full management over Events
              &amp; Competitions, Photo Archives, and Enrolled Members across Programming, Cyber
              Security, and Research wings.
            </p>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Club Members</span>
            <span className={styles.kpiVal}>{clubMembersList.length}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Active Events</span>
            <span className={styles.kpiVal}>{visibleEvents.length}</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiLabel}>Photo Archives</span>
            <span className={styles.kpiVal} style={{ color: '#6ee7b7' }}>
              {visibleGallery.length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tabsBar}>
        <button
          type="button"
          onClick={() => setCurrentTab('overview')}
          className={`${styles.tabBtn} ${currentTab === 'overview' ? styles.tabBtnActive : ''}`}
        >
          <LayoutDashboard style={{ width: '1rem', height: '1rem' }} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('events')}
          className={`${styles.tabBtn} ${currentTab === 'events' ? styles.tabBtnActive : ''}`}
        >
          <Calendar style={{ width: '1rem', height: '1rem' }} />
          <span>Events &amp; Competitions ({visibleEvents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('gallery')}
          className={`${styles.tabBtn} ${currentTab === 'gallery' ? styles.tabBtnActive : ''}`}
        >
          <ImageIcon style={{ width: '1rem', height: '1rem' }} />
          <span>Gallery Archives ({visibleGallery.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('members')}
          className={`${styles.tabBtn} ${currentTab === 'members' ? styles.tabBtnActive : ''}`}
        >
          <Users style={{ width: '1rem', height: '1rem' }} />
          <span>Enrolled Members ({clubMembersList.length})</span>
        </button>
      </div>

      {currentTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={`${styles.cardBox} ${styles.welcomeRow}`}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#D40000', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Sparkles style={{ width: '1rem', height: '1rem' }} /> CUCC Controller Operations
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Welcome back, {user?.name || 'Tanvir Ahmed'}!
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#737373', maxWidth: '36rem' }}>
                You have exclusive management authority over City University Computer Club (CUCC)
                across Programming, Cyber Security, and Research wings. Create events, curate photo
                archives, and monitor student members. Official circulars are managed directly from
                the Notice board.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleOpenCreateEvent}
                className="cuec-btn-primary"
                style={{ padding: '0.625rem 1rem', fontSize: '0.75rem' }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                <span>Create Event</span>
              </button>
              <button
                type="button"
                onClick={handleOpenCreateGal}
                style={{
                  padding: '0.625rem 1rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #d4d4d4',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <ImageIcon style={{ width: '1rem', height: '1rem' }} />
                <span>Upload Photo</span>
              </button>
            </div>
          </div>

          <div className={styles.cardBox} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f5', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ width: '1rem', height: '1rem', color: '#D40000' }} />
                Active CUCC Events ({visibleEvents.length})
              </h4>
              <button
                type="button"
                onClick={() => setCurrentTab('events')}
                style={{ fontSize: '0.75rem', color: '#D40000', fontWeight: 600, cursor: 'pointer' }}
              >
                Manage All Events
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {visibleEvents.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    padding: '0.875rem',
                    borderRadius: '0.75rem',
                    border: '1px solid #e5e5e5',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#171717' }}>
                        {evt.title}
                      </span>
                      <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '10px', backgroundColor: '#fee2e2', color: '#D40000', fontWeight: 700, textTransform: 'uppercase' }}>
                        {evt.wingSlug.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#737373', fontFamily: 'var(--font-mono)', marginTop: '0.125rem' }}>
                      {evt.date} • {evt.venue}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditEvent(evt)}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid #d4d4d4',
                      color: '#171717',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}

              {visibleEvents.length === 0 && (
                <p style={{ textAlign: 'center', padding: '1.5rem 0', fontSize: '0.75rem', color: '#a3a3a3' }}>
                  No events created yet for CUCC.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {currentTab === 'events' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#D40000' }} />
                Computer Club (CUCC) Events ({visibleEvents.length})
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#737373' }}>
                Publish and manage hackathons, bootcamps, workshops, and research symposiums across
                Programming, Cyber Security, and Research wings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateEvent}
              className="cuec-btn-primary"
              style={{ padding: '0.625rem 1rem', fontSize: '0.75rem' }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              <span>Create New Event</span>
            </button>
          </div>

          <div className={styles.twoColEvents}>
            {visibleEvents.map((evt) => (
              <div
                key={evt.id}
                className={styles.cardBox}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#fef3c7', color: '#78350f', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase' }}>
                      {evt.wingSlug.replace('_', ' ')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#737373', fontWeight: 600 }}>
                      {evt.date}
                    </span>
                  </div>

                  <h4 style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.375 }}>
                    {evt.title}
                  </h4>

                  <p className="line-clamp-2" style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>
                    {evt.description}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>
                      Venue: <strong>{evt.venue}</strong>
                    </div>
                    <div>
                      Time: {evt.time} • Registered: {evt.registeredCount || 0} (Unlimited Seats)
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f5f5f5', fontSize: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setAttendeeRosterEvent(evt)}
                    style={{ color: '#D40000', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View Attendees ({evt.registeredCount || 0})
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEditEvent(evt)}
                      style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1px solid #d4d4d4', cursor: 'pointer' }}
                      title="Edit Event"
                    >
                      <Edit3 style={{ width: '0.875rem', height: '0.875rem' }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(evt.id, evt.title)}
                      style={{ padding: '0.375rem', borderRadius: '0.5rem', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer' }}
                      title="Delete Event"
                    >
                      <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {visibleEvents.length === 0 && (
              <div className={styles.cardBox} style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '0.75rem', color: '#a3a3a3' }}>
                No events currently scheduled. Click "Create New Event" to launch one!
              </div>
            )}
          </div>
        </div>
      )}

      {currentTab === 'gallery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon style={{ width: '1.25rem', height: '1.25rem', color: '#D40000' }} />
                CUCC Photo Archives ({visibleGallery.length})
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#737373' }}>
                Curate high-resolution event and workshop photos across Programming, Cyber Security,
                and Research wings.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <select
                value={galWingFilter}
                onChange={(e) => setGalWingFilter(e.target.value)}
                className="cuec-select"
                style={{ width: 'auto' }}
              >
                <option value="all">All CUCC Wings</option>
                {activeWings.map((w) => (
                  <option key={w.slug} value={w.slug}>
                    {w.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleOpenCreateGal}
                className="cuec-btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                <span>Upload Photos</span>
              </button>
            </div>
          </div>

          <div className={styles.galleryGrid}>
            {visibleGallery
              .filter((g) => galWingFilter === 'all' || g.wingSlug === galWingFilter)
              .map((item) => (
                <div key={item.id} className={styles.galTile}>
                  <img src={item.imageUrl} alt={item.title} className={styles.galImg} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3), transparent)', padding: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <span style={{ alignSelf: 'flex-start', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '9px', backgroundColor: 'rgba(220,38,38,0.9)', color: '#ffffff', fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.wingSlug.replace('_', ' ')}
                    </span>

                    <div>
                      <h5 className="line-clamp-1" style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.75rem' }}>
                        {item.title}
                      </h5>
                      <p style={{ fontSize: '10px', color: '#d4d4d4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.eventName}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditGal(item)}
                          style={{ padding: '0.25rem', borderRadius: '0.25rem', backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', cursor: 'pointer' }}
                          title="Edit"
                        >
                          <Edit3 style={{ width: '0.875rem', height: '0.875rem' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGalleryItem(item.id, item.title)}
                          style={{ padding: '0.25rem', borderRadius: '0.25rem', backgroundColor: 'rgba(220,38,38,0.8)', color: '#ffffff', cursor: 'pointer' }}
                          title="Delete"
                        >
                          <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {currentTab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users style={{ width: '1.25rem', height: '1.25rem', color: '#D40000' }} />
                CUCC Membership &amp; Wing Approvals
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#737373' }}>
                Exclusive CUCC Controller authority: review pending applications across all 3 wings
                or oversee enrolled student rosters.
              </p>
            </div>

            <div style={{ padding: '0.25rem', borderRadius: '0.75rem', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
              <button
                type="button"
                onClick={() => setMemberSubTab('approvals')}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: memberSubTab === 'approvals' ? '#D40000' : 'transparent',
                  color: memberSubTab === 'approvals' ? '#ffffff' : '#525252'
                }}
              >
                <UserCheck style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>
                  Approval Members (
                  {memberRequests.filter((r) => r.clubId === 'computer_club' && r.status === 'pending').length}
                  )
                </span>
              </button>
              <button
                type="button"
                onClick={() => setMemberSubTab('roster')}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: memberSubTab === 'roster' ? '#D40000' : 'transparent',
                  color: memberSubTab === 'roster' ? '#ffffff' : '#525252'
                }}
              >
                <Users style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Enrolled Roster ({clubMembersList.length})</span>
              </button>
            </div>
          </div>

          {memberSubTab === 'approvals' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.cardBox} style={{ padding: '0.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                <div style={{ position: 'relative', flex: '1 1 240px' }}>
                  <Search style={{ width: '1rem', height: '1rem', color: '#a3a3a3', position: 'absolute', left: '0.75rem', top: '0.65rem' }} />
                  <input
                    type="text"
                    placeholder="Search applicant by name, student ID, department, or wing..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="cuec-input"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <select
                    value={memberWingFilter}
                    onChange={(e) => setMemberWingFilter(e.target.value)}
                    className="cuec-select"
                    style={{ width: '13rem' }}
                  >
                    <option value="all">All CUCC Wings</option>
                    {activeWings.map((w) => (
                      <option key={w.slug} value={w.slug}>
                        {w.label}
                      </option>
                    ))}
                  </select>

                  {memberRequests.filter((r) => r.clubId === 'computer_club' && r.status === 'pending').length > 0 && (
                    <button
                      type="button"
                      onClick={handleApproveAllPending}
                      disabled={actionProcessing}
                      className="cuec-btn-primary"
                      style={{ padding: '0.5rem 0.875rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      <Check style={{ width: '0.875rem', height: '0.875rem' }} />
                      <span>Approve All</span>
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {memberRequests
                  .filter((r) => {
                    if (r.clubId !== 'computer_club') return false;
                    if (memberWingFilter !== 'all' && r.wingSlug !== memberWingFilter) return false;
                    if (memberSearch.trim()) {
                      const q = memberSearch.toLowerCase();
                      return (
                        r.name.toLowerCase().includes(q) ||
                        r.studentId.toLowerCase().includes(q) ||
                        r.email.toLowerCase().includes(q) ||
                        r.department.toLowerCase().includes(q) ||
                        r.wingSlug.toLowerCase().includes(q) ||
                        r.reason.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((req) => (
                    <div
                      key={req.id}
                      className={styles.cardBox}
                      style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: '1 1 260px', minWidth: 0 }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#D40000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', flexShrink: 0 }}>
                          {req.name.substring(0, 2)}
                        </div>

                        <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{req.name}</span>
                            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '10px', backgroundColor: '#fee2e2', color: '#D40000', fontWeight: 700, textTransform: 'uppercase' }}>
                              {req.wingSlug.replace('_', ' ')}
                            </span>
                            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '10px', backgroundColor: '#f5f5f5', color: '#525252', fontWeight: 600 }}>
                              {req.studentId}
                            </span>
                            <span style={{ fontSize: '11px', color: '#737373', fontFamily: 'var(--font-mono)' }}>
                              {req.department}
                            </span>
                          </div>

                          <p style={{ fontSize: '11px', color: '#737373', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
                            {req.email} • Applied on {new Date(req.submittedAt).toLocaleDateString()}
                          </p>

                          <div style={{ padding: '0.625rem', borderRadius: '0.75rem', backgroundColor: '#fafafa', border: '1px solid #e5e5e5', fontSize: '0.75rem', color: '#404040', marginTop: '0.5rem' }}>
                            <strong style={{ display: 'block', fontSize: '10px', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>
                              Statement of Interest:
                            </strong>
                            "{req.reason}"
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {req.status === 'pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveApplicant(req)}
                              disabled={actionProcessing}
                              style={{ padding: '0.375rem 0.875rem', borderRadius: '0.75rem', backgroundColor: '#059669', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}
                            >
                              <Check style={{ width: '0.875rem', height: '0.875rem' }} />
                              <span>Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectApplicant(req)}
                              disabled={actionProcessing}
                              style={{ padding: '0.375rem 0.75rem', borderRadius: '0.75rem', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                            >
                              <X style={{ width: '0.875rem', height: '0.875rem' }} />
                              <span>Decline</span>
                            </button>
                          </>
                        ) : (
                          <span
                            style={{
                              padding: '0.25rem 0.625rem',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono)',
                              textTransform: 'uppercase',
                              backgroundColor: req.status === 'approved' ? '#d1fae5' : '#f5f5f5',
                              color: req.status === 'approved' ? '#065f46' : '#525252'
                            }}
                          >
                            {req.status === 'approved' ? 'Enrolled Member' : 'Declined'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {memberSubTab === 'roster' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className={styles.cardBox} style={{ padding: '0.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative', flex: '1 1 240px' }}>
                  <Search style={{ width: '1rem', height: '1rem', color: '#a3a3a3', position: 'absolute', left: '0.75rem', top: '0.65rem' }} />
                  <input
                    type="text"
                    placeholder="Search member by name, student ID, or department..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="cuec-input"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>

                <select
                  value={memberWingFilter}
                  onChange={(e) => setMemberWingFilter(e.target.value)}
                  className="cuec-select"
                  style={{ width: '14rem' }}
                >
                  <option value="all">All CUCC Wings</option>
                  {activeWings.map((w) => (
                    <option key={w.slug} value={w.slug}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.tableWrap}>
                <div style={{ overflowX: 'auto' }}>
                  <table className={styles.table}>
                    <thead className={styles.thead}>
                      <tr>
                        <th className={styles.thCell}>Student Member</th>
                        <th className={styles.thCell}>Student ID</th>
                        <th className={styles.thCell}>Department</th>
                        <th className={styles.thCell}>Assigned Wing</th>
                        <th className={styles.thCell}>Joined Date</th>
                        <th className={styles.thCell} style={{ textAlign: 'right' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clubMembersList
                        .filter((m) => {
                          if (memberWingFilter !== 'all' && m.assignedWing !== memberWingFilter) {
                            return false;
                          }
                          if (memberSearch.trim()) {
                            const q = memberSearch.toLowerCase();
                            return (
                              m.name.toLowerCase().includes(q) ||
                              m.studentId.toLowerCase().includes(q) ||
                              m.email.toLowerCase().includes(q) ||
                              m.department.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((m) => (
                          <tr key={m.id} className={styles.tbodyRow}>
                            <td className={styles.tdCell}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '2rem', height: '2rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#D40000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', overflow: 'hidden', flexShrink: 0 }}>
                                  {m.avatar ? (
                                    <img
                                      src={m.avatar}
                                      alt={m.name}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  ) : (
                                    m.name.substring(0, 2)
                                  )}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700 }}>{m.name}</div>
                                  <div style={{ fontSize: '11px', color: '#737373', fontFamily: 'var(--font-mono)' }}>
                                    {m.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className={styles.tdCell} style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                              {m.studentId}
                            </td>
                            <td className={styles.tdCell}>{m.department}</td>
                            <td className={styles.tdCell}>
                              <span style={{ padding: '0.125rem 0.5rem', borderRadius: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '10px', backgroundColor: '#fee2e2', color: '#D40000', fontWeight: 700, textTransform: 'uppercase' }}>
                                {m.assignedWing ? m.assignedWing.replace('_', ' ') : 'General Member'}
                              </span>
                            </td>
                            <td className={styles.tdCell} style={{ fontFamily: 'var(--font-mono)', color: '#a3a3a3', fontSize: '11px' }}>
                              {m.joinedAt}
                            </td>
                            <td className={styles.tdCell} style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveMember(m)}
                                disabled={actionProcessing}
                                style={{ padding: '0.375rem 0.625rem', borderRadius: '0.5rem', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                              >
                                <UserMinus style={{ width: '0.875rem', height: '0.875rem' }} />
                                <span>Remove Member</span>
                              </button>
                            </td>
                          </tr>
                        ))}

                      {clubMembersList.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem 0', color: '#a3a3a3' }}>
                            No members currently enrolled in CUCC.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {galModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setGalModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon style={{ width: '1.25rem', height: '1.25rem' }} />
                <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                  {editingGalId ? 'Update Photo' : 'Add Photos to CUCC Wing Album'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGalModalOpen(false)}
                style={{ color: '#ffffff', cursor: 'pointer' }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', fontSize: '0.75rem' }}>
              {!editingGalId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.375rem', borderRadius: '0.75rem', backgroundColor: '#f5f5f5' }}>
                  <button
                    type="button"
                    onClick={() => setIsBatchMode(false)}
                    style={{
                      flex: 1,
                      padding: '0.375rem',
                      borderRadius: '0.5rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: !isBatchMode ? '#D40000' : 'transparent',
                      color: !isBatchMode ? '#ffffff' : '#525252'
                    }}
                  >
                    Single Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBatchMode(true)}
                    style={{
                      flex: 1,
                      padding: '0.375rem',
                      borderRadius: '0.5rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: isBatchMode ? '#D40000' : 'transparent',
                      color: isBatchMode ? '#ffffff' : '#525252'
                    }}
                  >
                    Batch Upload
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Target Wing Album *
                  </label>
                  <select
                    value={galWingSlug}
                    onChange={(e) => setGalWingSlug(e.target.value)}
                    className="cuec-select"
                  >
                    {activeWings.map((w) => (
                      <option key={w.slug} value={w.slug}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Event / Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hackathon 2026"
                    value={galEventName}
                    onChange={(e) => setGalEventName(e.target.value)}
                    className="cuec-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Photo Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Coding Finals Round"
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  className="cuec-input"
                />
              </div>

              {isBatchMode && !editingGalId ? (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Image URLs (One per line) *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="https://images.unsplash.com/..."
                    value={galBatchUrls}
                    onChange={(e) => setGalBatchUrls(e.target.value)}
                    className="cuec-textarea font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    value={galImageUrl}
                    onChange={(e) => setGalImageUrl(e.target.value)}
                    className="cuec-input font-mono"
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Caption (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short description..."
                  value={galCaption}
                  onChange={(e) => setGalCaption(e.target.value)}
                  className="cuec-textarea"
                />
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setGalModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #d4d4d4', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="cuec-btn-primary"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {editingGalId ? 'Update Photo' : 'Add to Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setEventModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ width: '1.25rem', height: '1.25rem' }} />
                <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                  {editingEventId ? 'Edit CUCC Event' : 'Create New CUCC Event'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                style={{ color: '#ffffff', cursor: 'pointer' }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', overflowY: 'auto', fontSize: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intra University Programming Contest"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="cuec-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Club Entity
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Computer Club (CUCC)"
                    className="cuec-input"
                    style={{ fontWeight: 700, opacity: 0.7 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Subsector Wing *
                  </label>
                  <select
                    value={eventWingSlug}
                    onChange={(e) => setEventWingSlug(e.target.value)}
                    className="cuec-select"
                  >
                    {activeWings.map((w) => (
                      <option key={w.slug} value={w.slug}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="cuec-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Time
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="cuec-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={eventCapacity}
                    onChange={(e) => setEventCapacity(e.target.value)}
                    className="cuec-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Venue *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Lab 402, Campus"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="cuec-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Banner URL
                </label>
                <input
                  type="text"
                  value={eventBanner}
                  onChange={(e) => setEventBanner(e.target.value)}
                  className="cuec-input font-mono"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="cuec-textarea"
                />
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e5e5e5', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEventModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', border: '1px solid #d4d4d4', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="cuec-btn-primary"
                  style={{ padding: '0.5rem 1.25rem' }}
                >
                  {editingEventId ? 'Save Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {attendeeRosterEvent && (
        <div className={styles.modalBackdrop} onClick={() => setAttendeeRosterEvent(null)}>
          <div className={styles.modalCard} style={{ maxWidth: '42rem', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
                  {attendeeRosterEvent.title}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#fee2e2' }}>
                  Registered Student Attendee Pass Roster
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAttendeeRosterEvent(null)}
                style={{ color: '#ffffff', cursor: 'pointer' }}
              >
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', overflowY: 'auto', fontSize: '0.75rem' }}>
              {attendeeRosterEvent.registrations?.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {attendeeRosterEvent.registrations.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '0.625rem 0',
                        borderBottom: '1px solid #e5e5e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 700, display: 'block' }}>{r.userName}</span>
                        <span style={{ fontSize: '11px', color: '#737373', fontFamily: 'var(--font-mono)' }}>
                          {r.studentId} • {r.department}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#059669', fontWeight: 700 }}>
                        {r.ticketCode}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '2rem 0', color: '#a3a3a3' }}>
                  No students registered yet for this event.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
