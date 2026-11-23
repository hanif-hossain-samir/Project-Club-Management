import React, { useState, useEffect } from 'react';
import {
  Code2,
  Microscope,
  Clock,
  MapPin,
  CheckCircle2,
  Award,
  ChevronRight,
  Shield,
  BookOpen,
  UserCheck,
  Check,
  X,
  AlertCircle,
  Search
} from 'lucide-react';
import { WingIcon } from '../components/WingIcon.jsx';
import { api } from '../api.js';
import { useAuth } from '../auth.js';
import { INITIAL_MEMBER_REQUESTS } from '../seedDefaults.js';
import styles from './ClubsPage.module.css';

export const ClubsPage = ({
  clubs,
  selectedWing,
  setSelectedWing,
  onRefreshData
}) => {
  const { user } = useAuth();

  const currentClub = clubs.find((c) => c.id === 'computer_club') || clubs[0];
  const cuccWings = currentClub
    ? currentClub.wings.filter(
        (w) => w.slug === 'programming' || w.slug === 'cyber_security' || w.slug === 'research'
      )
    : [];
  const [activeWingSlug, setActiveWingSlug] = useState('programming');

  const [memberRequests, setMemberRequests] = useState(INITIAL_MEMBER_REQUESTS);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [notification, setNotification] = useState(null);

  const [allWingsTab, setAllWingsTab] = useState('all');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  useEffect(() => {
    if (!approvalModalOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setApprovalModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [approvalModalOpen]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchMemberRequests = async () => {
    try {
      const res = await api.getMemberRequests(user?.id);
      if (res.success && res.requests) {
        setMemberRequests(res.requests);
      }
    } catch {
      // keep initial seed requests
    }
  };

  useEffect(() => {
    fetchMemberRequests();
  }, [user]);

  useEffect(() => {
    if (
      selectedWing &&
      (selectedWing.slug === 'programming' ||
        selectedWing.slug === 'cyber_security' ||
        selectedWing.slug === 'research')
    ) {
      setActiveWingSlug(selectedWing.slug);
      setSelectedWing(null);
    }
  }, [selectedWing, setSelectedWing]);

  const activeWing = cuccWings.find((w) => w.slug === activeWingSlug) || cuccWings[0];

  const getPendingCountForWing = (slug) =>
    memberRequests.filter(
      (r) => r.clubId === 'computer_club' && r.wingSlug === slug && r.status === 'pending'
    ).length;

  const totalPendingAcrossAllWings = memberRequests.filter(
    (r) => r.clubId === 'computer_club' && r.status === 'pending'
  ).length;

  const allCuccApplicants = memberRequests.filter((r) => r.clubId === 'computer_club');

  const filteredApplicants = allCuccApplicants.filter((req) => {
    if (allWingsTab !== 'all' && req.wingSlug !== allWingsTab) return false;
    if (statusFilter === 'pending' && req.status !== 'pending') return false;
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase();
      const match =
        req.name.toLowerCase().includes(q) ||
        req.studentId.toLowerCase().includes(q) ||
        req.department.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.reason.toLowerCase().includes(q) ||
        req.wingSlug.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const pendingInFilteredView = filteredApplicants.filter((r) => r.status === 'pending');

  const handleApproveMember = async (req) => {
    setActionProcessing(true);
    try {
      const res = await api.approveMemberRequest(req.id, user?.id);
      if (res.success) {
        setMemberRequests((prev) =>
          prev.map((item) => (item.id === req.id ? { ...item, status: 'approved' } : item))
        );
        setNotification({
          type: 'success',
          message: `Approved ${req.name} (${req.studentId}) for ${req.wingSlug.replace('_', ' ').toUpperCase()}! Enrolled in CUCC.`
        });
        if (onRefreshData) onRefreshData();
      } else {
        setNotification({ type: 'error', message: res.message || 'Failed to approve applicant.' });
      }
    } catch (e) {
      setNotification({ type: 'error', message: e.message || 'Network error approving member.' });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRejectMember = async (req) => {
    if (!window.confirm(`Decline membership application for "${req.name}" (${req.studentId})?`)) {
      return;
    }
    setActionProcessing(true);
    try {
      const res = await api.rejectMemberRequest(req.id, user?.id);
      if (res.success) {
        setMemberRequests((prev) =>
          prev.map((item) => (item.id === req.id ? { ...item, status: 'rejected' } : item))
        );
        setNotification({ type: 'success', message: `Application for ${req.name} declined.` });
      } else {
        setNotification({
          type: 'error',
          message: res.message || 'Failed to decline application.'
        });
      }
    } catch (e) {
      setNotification({ type: 'error', message: e.message || 'Network error declining member.' });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleApproveAllFiltered = async () => {
    if (pendingInFilteredView.length === 0) return;
    const targetDesc =
      allWingsTab === 'all' ? 'All CUCC Wings' : `${allWingsTab.replace('_', ' ')} wing`;
    if (
      !window.confirm(
        `Approve all ${pendingInFilteredView.length} pending applicants for ${targetDesc}?`
      )
    ) {
      return;
    }
    setActionProcessing(true);
    try {
      let count = 0;
      for (const req of pendingInFilteredView) {
        const res = await api.approveMemberRequest(req.id, user?.id);
        if (res.success) count++;
      }
      setMemberRequests((prev) =>
        prev.map((item) =>
          pendingInFilteredView.some((p) => p.id === item.id)
            ? { ...item, status: 'approved' }
            : item
        )
      );
      setNotification({
        type: 'success',
        message: `Successfully approved all ${count} student applicants for ${targetDesc}!`
      });
      if (onRefreshData) onRefreshData();
    } catch (e) {
      setNotification({ type: 'error', message: e.message || 'Error executing batch approvals.' });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleOpenAllApprovals = () => {
    setAllWingsTab('all');
    setStatusFilter('pending');
    setApplicantSearch('');
    setApprovalModalOpen(true);
  };

  const handleOpenWingApprovals = (e, slug, pendingCount) => {
    e.stopPropagation();
    setActiveWingSlug(slug);
    setAllWingsTab(slug);
    setStatusFilter(pendingCount > 0 ? 'pending' : 'all');
    setApplicantSearch('');
    setApprovalModalOpen(true);
  };

  return (
    <div className={styles.page}>
      {notification && (
        <div
          className={`${styles.toast} ${
            notification.type === 'success' ? styles.toastSuccess : styles.toastError
          }`}
        >
          <div className={styles.toastLeft}>
            {notification.type === 'success' ? (
              <CheckCircle2 style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
            ) : (
              <AlertCircle style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
            )}
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className={styles.toastClose}>
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>
      )}

      <div className={styles.pageHeader}>
        <div className={styles.kickerPill}>Official University Club Hub</div>
        <h1 className={styles.pageTitle}>City University Computer Club (CUCC)</h1>
        <p className={styles.pageDesc}>
          Premier technological society with 3 specialized wings dedicated to software engineering,
          offensive &amp; defensive security, and academic scientific innovation.
        </p>
      </div>

      <div className={styles.clubSection}>
        {currentClub && (
          <div className={styles.clubBanner}>
            <div className={styles.clubBannerInner}>
              <div className={styles.clubMetaRow}>
                <span className={styles.clubCodeBadge}>{currentClub.shortCode}</span>
                <span className={styles.clubMetaMuted}>
                  Established {currentClub.establishedYear}
                </span>
                <span className={styles.clubMetaMuted}>•</span>
                <span className={styles.clubMetaMuted}>
                  {currentClub.totalMembers} Registered Student Members
                </span>
              </div>

              <h2 className={styles.clubName}>{currentClub.name}</h2>
              <p className={styles.clubMotto}>"{currentClub.motto}"</p>

              <div className={styles.clubInfoGrid}>
                <div>
                  <span className={styles.clubInfoLabel}>Faculty Advisor</span>
                  <span className={styles.clubInfoVal}>{currentClub.advisorName}</span>
                  <span className={styles.clubInfoSub}>{currentClub.advisorDesignation}</span>
                </div>
                <div>
                  <span className={styles.clubInfoLabel}>Student President</span>
                  <span className={styles.clubInfoVal}>{currentClub.presidentName}</span>
                  <span className={styles.clubInfoSub}>Central Student Council</span>
                </div>
                <div>
                  <span className={styles.clubInfoLabel}>Contact &amp; Hotline</span>
                  <span className={styles.clubInfoVal}>{currentClub.email}</span>
                  <span className={styles.clubInfoSub}>{currentClub.hotline}</span>
                </div>
              </div>
            </div>

            <div className={styles.bannerApprovalBox}>
              <div className={styles.bannerApprovalLeft}>
                <div className={styles.bannerApprovalIcon}>
                  <UserCheck style={{ width: '1.125rem', height: '1.125rem' }} />
                </div>
                <div>
                  <div className={styles.bannerApprovalTitleRow}>
                    <h3 className={styles.bannerApprovalTitle}>
                      Approval Members — All CUCC Wings
                    </h3>
                    <span className={styles.bannerPendingBadge}>
                      {totalPendingAcrossAllWings} Pending{' '}
                      {totalPendingAcrossAllWings === 1 ? 'Approval' : 'Approvals'}
                    </span>
                  </div>
                  <p className={styles.bannerApprovalSub}>
                    Programming ({getPendingCountForWing('programming')}) • Cyber Security (
                    {getPendingCountForWing('cyber_security')}) • Research (
                    {getPendingCountForWing('research')})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenAllApprovals}
                className={styles.approvePendingTriggerBtn}
              >
                <UserCheck style={{ width: '0.95rem', height: '0.95rem' }} />
                <span>Approve Pending</span>
              </button>
            </div>
          </div>
        )}

        {approvalModalOpen && (
          <div
            className={styles.approvalModalBackdrop}
            onClick={() => setApprovalModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Approval Members — All CUCC Wings"
          >
            <div className={styles.approvalConsole} onClick={(e) => e.stopPropagation()}>
              <div className={styles.consoleHeader}>
                <div className={styles.consoleTitleRow}>
                  <div className={styles.consoleIconBox}>
                    <UserCheck style={{ width: '1.25rem', height: '1.25rem' }} />
                  </div>
                  <div>
                    <h3 className={styles.consoleTitle}>Approval Members — All CUCC Wings</h3>
                    <span className={styles.consoleSub}>
                      Controller Command Console • Review and approve student membership across
                      Programming Club, Cyber Security Club, and Research Club
                    </span>
                  </div>
                </div>

                <div className={styles.consoleActions}>
                  <span
                    className={`${styles.pendingCounterBadge} ${
                      totalPendingAcrossAllWings > 0 ? styles.pendingAmber : styles.pendingGreen
                    }`}
                  >
                    <UserCheck style={{ width: '0.875rem', height: '0.875rem' }} />
                    {totalPendingAcrossAllWings} Pending Approval Across All Wings
                  </span>

                  {pendingInFilteredView.length > 0 && (
                    <button
                      type="button"
                      onClick={handleApproveAllFiltered}
                      disabled={actionProcessing}
                      className={styles.approveAllBtn}
                    >
                      <Check style={{ width: '1rem', height: '1rem' }} />
                      <span>Approve All Pending ({pendingInFilteredView.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setApprovalModalOpen(false)}
                    className={styles.modalCloseBtn}
                    aria-label="Close Approval Members Modal"
                    title="Close"
                  >
                    <X style={{ width: '1.125rem', height: '1.125rem' }} />
                  </button>
                </div>
              </div>

          <div className={styles.filterBlock}>
            <div className={styles.wingFilterPills}>
              <button
                type="button"
                onClick={() => setAllWingsTab('all')}
                className={`${styles.wingPillBtn} ${allWingsTab === 'all' ? styles.wingPillBtnActive : ''}`}
              >
                All 3 Wings ({allCuccApplicants.filter((r) => r.status === 'pending').length}{' '}
                pending)
              </button>

              <button
                type="button"
                onClick={() => setAllWingsTab('programming')}
                className={`${styles.wingPillBtn} ${
                  allWingsTab === 'programming' ? styles.wingPillBtnActive : ''
                }`}
              >
                <Code2 style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Programming Club ({getPendingCountForWing('programming')} pending)</span>
              </button>

              <button
                type="button"
                onClick={() => setAllWingsTab('cyber_security')}
                className={`${styles.wingPillBtn} ${
                  allWingsTab === 'cyber_security' ? styles.wingPillBtnActive : ''
                }`}
              >
                <Shield style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Cyber Security Club ({getPendingCountForWing('cyber_security')} pending)</span>
              </button>

              <button
                type="button"
                onClick={() => setAllWingsTab('research')}
                className={`${styles.wingPillBtn} ${
                  allWingsTab === 'research' ? styles.wingPillBtnActive : ''
                }`}
              >
                <Microscope style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Research Club ({getPendingCountForWing('research')} pending)</span>
              </button>
            </div>

            <div className={styles.searchStatusRow}>
              <div className={styles.searchWrap}>
                <Search className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search applicants by student name, ID, department, or wing..."
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  className={styles.searchInput}
                />
                {applicantSearch && (
                  <button
                    type="button"
                    onClick={() => setApplicantSearch('')}
                    className={styles.searchClear}
                  >
                    <X style={{ width: '1rem', height: '1rem' }} />
                  </button>
                )}
              </div>

              <div className={styles.statusSegment}>
                <button
                  type="button"
                  onClick={() => setStatusFilter('pending')}
                  className={`${styles.statusTabBtn} ${
                    statusFilter === 'pending' ? styles.statusTabBtnActive : ''
                  }`}
                >
                  Pending Review (
                  {
                    allCuccApplicants.filter(
                      (r) =>
                        (allWingsTab === 'all' || r.wingSlug === allWingsTab) &&
                        r.status === 'pending'
                    ).length
                  }
                  )
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`${styles.statusTabBtn} ${
                    statusFilter === 'all' ? styles.statusTabBtnActive : ''
                  }`}
                >
                  All Applications (
                  {
                    allCuccApplicants.filter(
                      (r) => allWingsTab === 'all' || r.wingSlug === allWingsTab
                    ).length
                  }
                  )
                </button>
              </div>
            </div>
          </div>

          <div className={styles.applicantList}>
            {filteredApplicants.map((req) => (
              <div key={req.id} className={styles.applicantCard}>
                <div className={styles.applicantMain}>
                  <div className={styles.avatarInitials}>{req.name.substring(0, 2)}</div>

                  <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                    <div className={styles.applicantMeta}>
                      <span className={styles.applicantName}>{req.name}</span>
                      <span className={styles.wingChip}>{req.wingSlug.replace('_', ' ')}</span>
                      <span className={styles.idChip}>{req.studentId}</span>
                      <span className={styles.deptText}>{req.department}</span>
                    </div>

                    <div className={styles.emailDate}>
                      {req.email} • Applied on:{' '}
                      {new Date(req.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>

                    <div className={styles.statementBox}>
                      <strong className={styles.statementLabel}>
                        Statement of Interest &amp; Technical Background:
                      </strong>
                      "{req.reason}"
                    </div>
                  </div>
                </div>

                <div className={styles.applicantActions}>
                  {req.status === 'pending' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleApproveMember(req)}
                        disabled={actionProcessing}
                        className={styles.approveBtn}
                        title="Approve student and enroll into wing"
                      >
                        <Check style={{ width: '0.875rem', height: '0.875rem' }} />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectMember(req)}
                        disabled={actionProcessing}
                        className={styles.declineBtn}
                        title="Decline application"
                      >
                        <X style={{ width: '0.875rem', height: '0.875rem' }} />
                        <span>Decline</span>
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`${styles.statusBadge} ${
                        req.status === 'approved' ? styles.statusApproved : styles.statusDeclined
                      }`}
                    >
                      {req.status === 'approved' ? (
                        <>
                          <Check style={{ width: '0.75rem', height: '0.75rem' }} />
                          <span>Enrolled Member</span>
                        </>
                      ) : (
                        <>
                          <X style={{ width: '0.75rem', height: '0.75rem' }} />
                          <span>Declined</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {filteredApplicants.length === 0 && (
              <div className={styles.emptyQueue}>
                <UserCheck
                  style={{ width: '2rem', height: '2rem', color: '#a3a3a3', margin: '0 auto' }}
                />
                <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  No {statusFilter === 'pending' ? 'pending' : ''} membership applications found
                  matching your criteria.
                </p>
                <p style={{ fontSize: '11px', color: '#737373' }}>
                  Students applying to Programming, Cyber Security, or Research wings appear here in
                  the CUCC Controller queue.
                </p>
              </div>
            )}
          </div>
        </div>
          </div>
        )}
      </div>

      <div className={styles.wingsNavSection}>
        <div className={styles.wingsNavHeader}>
          <div>
            <h3 className={styles.wingsHeading}>
              Specialized Wings for {currentClub?.shortCode || 'CUCC'}
            </h3>
            <span className={styles.wingsHint}>
              Select a wing below to inspect member approvals, leadership, activities and schedule
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className={styles.totalPendingChip}>
              Total Pending Across Wings:{' '}
              <strong style={{ color: '#D40000' }}>
                {getPendingCountForWing('programming') +
                  getPendingCountForWing('cyber_security') +
                  getPendingCountForWing('research')}
              </strong>
            </span>
          </div>
        </div>

        <div className={styles.wingCardsGrid}>
          {cuccWings.map((wing) => {
            const isSelected = activeWingSlug === wing.slug;
            const pendingCount = getPendingCountForWing(wing.slug);

            return (
              <button
                key={wing.id}
                type="button"
                onClick={() => setActiveWingSlug(wing.slug)}
                className={`${styles.wingSelectorCard} ${
                  isSelected ? styles.wingSelectorCardActive : ''
                }`}
              >
                <div className={styles.wingCardTop}>
                  <div className={styles.wingCardLeft}>
                    <div
                      className={`${styles.wingCardIcon} ${
                        isSelected ? styles.wingCardIconActive : ''
                      }`}
                    >
                      <WingIcon
                        slug={wing.slug}
                        isSelected={isSelected}
                        style={{ width: '1.25rem', height: '1.25rem' }}
                      />
                    </div>
                    <div>
                      <span className={styles.wingCardKicker}>{wing.kicker}</span>
                      <h4
                        className={`${styles.wingCardTitle} ${
                          isSelected ? styles.wingCardTitleActive : ''
                        }`}
                      >
                        {wing.name}
                      </h4>
                      <span className={styles.wingCardBadge}>{wing.badge}</span>
                    </div>
                  </div>

                  <ChevronRight
                    style={{
                      width: '1rem',
                      height: '1rem',
                      color: isSelected ? '#D40000' : '#a3a3a3',
                      flexShrink: 0
                    }}
                  />
                </div>

                <div className={styles.wingQueueFooter}>
                  <span style={{ fontSize: '11px', color: '#737373', fontWeight: 500 }}>
                    Membership Queue
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleOpenWingApprovals(e, wing.slug, pendingCount)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenWingApprovals(e, wing.slug, pendingCount);
                      }
                    }}
                    title={`Approve members for ${wing.name}`}
                    className={`${styles.queuePill} ${
                      pendingCount > 0 ? styles.pendingAmber : styles.pendingGreen
                    }`}
                  >
                    <UserCheck style={{ width: '0.75rem', height: '0.75rem' }} />
                    {pendingCount > 0 ? `${pendingCount} Pending` : 'All Approved'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {activeWing && (
        <div className={styles.deepDiveCard}>
          <div className={styles.deepDiveBanner}>
            <img src={activeWing.bannerUrl} alt={activeWing.name} className={styles.deepDiveImg} />
            <div className={styles.deepDiveScrim} />

            <div className={styles.deepDiveOverlay}>
              <div className={styles.deepDiveTags}>
                <span className={styles.ddTagRed}>{activeWing.badge}</span>
                <span className={styles.ddTagDark}>{activeWing.kicker}</span>
                <span className={styles.ddTagAmber}>
                  {getPendingCountForWing(activeWing.slug)} Applications Waiting
                </span>
              </div>
              <h3 className={styles.ddTitle}>{activeWing.name}</h3>
              <p className={styles.ddDesc}>{activeWing.fullDesc}</p>
            </div>
          </div>

          <div className={styles.scheduleStrip}>
            <div className={styles.stripItem}>
              <Clock style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0 }} />
              <div>
                <span className={styles.stripLabel}>Weekly Schedule</span>
                <span className={styles.stripVal}>{activeWing.weeklySchedule}</span>
              </div>
            </div>

            <div className={styles.stripItem}>
              <MapPin style={{ width: '1rem', height: '1rem', color: '#D40000', flexShrink: 0 }} />
              <div>
                <span className={styles.stripLabel}>Physical Base / Lab</span>
                <span className={styles.stripVal}>{activeWing.roomLocation}</span>
              </div>
            </div>
          </div>

          <div className={styles.ddBody}>
            <div className={styles.ddMainCol}>
              <div>
                <h4 className={styles.subHeading}>
                  <BookOpen style={{ width: '1rem', height: '1rem', color: '#D40000' }} />
                  Mission &amp; Strategic Vision
                </h4>
                <p className={styles.visionBox}>{activeWing.vision}</p>
              </div>

              <div>
                <h4 className={styles.subHeading}>
                  <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#D40000' }} />
                  Regular Activities &amp; Flagship Programs
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {activeWing.keyActivities.map((act, idx) => (
                    <div key={idx} className={styles.activityRow}>
                      <span className={styles.actNum}>{idx + 1}</span>
                      <span style={{ lineHeight: 1.625, fontWeight: 500 }}>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className={styles.subHeading}>
                  <Award style={{ width: '1rem', height: '1rem', color: '#D40000' }} />
                  Recent Achievements &amp; University Honors
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeWing.pastAchievements.map((ach, idx) => (
                    <div key={idx} className={styles.achievementCard}>
                      <div className={styles.achTop}>
                        <span className={styles.achTitle}>{ach.title}</span>
                        <span className={styles.achYear}>{ach.year}</span>
                      </div>
                      <p className={styles.achDesc}>{ach.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.ddSideCol}>
              <div className={styles.leadershipCard}>
                <h4 className={styles.leadershipTitle}>Wing Leadership &amp; Conveners</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeWing.conveners.map((conv) => (
                    <div key={conv.id} className={styles.convenerCard}>
                      <img
                        src={conv.avatar}
                        alt={conv.name}
                        className={styles.convenerAvatar}
                      />
                      <div style={{ flex: '1 1 0%', minWidth: 0, fontSize: '0.75rem' }}>
                        <p style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {conv.name}
                        </p>
                        <p style={{ color: '#D40000', fontWeight: 600, fontSize: '11px' }}>
                          {conv.designation}
                        </p>
                        <p style={{ color: '#737373', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Dept. of {conv.department}
                        </p>
                        <p style={{ color: '#a3a3a3', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
                          {conv.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
