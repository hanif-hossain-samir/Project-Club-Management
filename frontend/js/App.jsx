import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './theme.js';
import { AuthProvider, useAuth } from './auth.js';
import { Navbar } from './components/Navbar.jsx';
import { MobileBottomNav } from './components/MobileBottomNav.jsx';
import { NoticeTicker } from './components/NoticeTicker.jsx';
import { Footer } from './components/Footer.jsx';
import { AuthModal } from './components/AuthModal.jsx';
import { EventTicketModal } from './components/EventTicketModal.jsx';
import { SearchModal } from './components/SearchModal.jsx';

import { HomePage } from './pages/HomePage.jsx';
import { ClubsPage } from './pages/ClubsPage.jsx';
import { EventsPage } from './pages/EventsPage.jsx';
import { AnnouncementsPage } from './pages/AnnouncementsPage.jsx';
import { GalleryPage } from './pages/GalleryPage.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AboutContactPage } from './pages/AboutContactPage.jsx';

import { api } from './api.js';
import {
  INITIAL_CLUBS,
  INITIAL_EVENTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GALLERY
} from './seedDefaults.js';

const AppContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const [clubs, setClubs] = useState(INITIAL_CLUBS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [gallery, setGallery] = useState(INITIAL_GALLERY);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedWing, setSelectedWing] = useState(null);
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadData = async () => {
    try {
      const [clubsRes, eventsRes, annRes, galRes] = await Promise.all([
        api.getClubs().catch(() => ({ success: false, clubs: INITIAL_CLUBS })),
        api.getEvents().catch(() => ({ success: false, events: INITIAL_EVENTS })),
        api.getAnnouncements().catch(() => ({ success: false, announcements: INITIAL_ANNOUNCEMENTS })),
        api.getGallery().catch(() => ({ success: false, gallery: INITIAL_GALLERY }))
      ]);

      if (clubsRes.success && clubsRes.clubs) setClubs(clubsRes.clubs);
      if (eventsRes.success && eventsRes.events) setEvents(eventsRes.events);
      if (annRes.success && annRes.announcements) setAnnouncements(annRes.announcements);
      if (galRes.success && galRes.gallery) setGallery(galRes.gallery);
    } catch {
      // Keep initial seeded data fallback
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleEventRegistered = (updatedEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  const handleOpenTicket = (event, registration) => {
    setActiveTicket({ event, registration });
  };

  const handlePhotoLiked = (id, newLikes) => {
    setGallery((prev) => prev.map((g) => (g.id === id ? { ...g, likes: newLikes } : g)));
  };

  const handlePhotoAdded = (item) => {
    setGallery((prev) => [item, ...prev]);
  };

  const handlePhotosAdded = (newItems) => {
    setGallery((prev) => [...newItems, ...prev]);
  };

  const handleSelectWingFromHome = (wing) => {
    setSelectedWing(wing);
    setActiveTab('clubs');
  };

  return (
    <div className="cuec-app-shell">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuthModal={() => setAuthModalOpen(true)}
        openSearchModal={() => setSearchModalOpen(true)}
      />

      <NoticeTicker
        announcements={announcements}
        onSelectNotice={(ann) => {
          setSelectedNoticeModal(ann);
          setActiveTab('announcements');
        }}
      />

      <main className="cuec-main-content">
        {activeTab === 'home' && (
          <HomePage
            clubs={clubs}
            events={events}
            setActiveTab={setActiveTab}
            onSelectEvent={(evt) => {
              setSelectedEventModal(evt);
              setActiveTab('events');
            }}
            onSelectWing={handleSelectWingFromHome}
          />
        )}

        {activeTab === 'clubs' && (
          <ClubsPage
            clubs={clubs}
            selectedWing={selectedWing}
            setSelectedWing={setSelectedWing}
            setActiveTab={setActiveTab}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'events' && (
          <EventsPage
            events={events}
            onEventRegistered={handleEventRegistered}
            selectedEventForModal={selectedEventModal}
            setSelectedEventForModal={setSelectedEventModal}
            openTicketModal={handleOpenTicket}
          />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsPage
            announcements={announcements}
            selectedNotice={selectedNoticeModal}
            setSelectedNotice={setSelectedNoticeModal}
            setActiveTab={setActiveTab}
            onRefreshNotices={loadData}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryPage
            gallery={gallery}
            onPhotoLiked={handlePhotoLiked}
            onPhotoAdded={handlePhotoAdded}
            onPhotosAdded={handlePhotosAdded}
          />
        )}

        {activeTab === 'dashboard' && (
          <AdminDashboard
            clubs={clubs}
            events={events}
            announcements={announcements}
            gallery={gallery}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'about' && <AboutContactPage />}
      </main>

      <Footer setActiveTab={setActiveTab} />

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {activeTicket && (
        <EventTicketModal
          event={activeTicket.event}
          registration={activeTicket.registration}
          onClose={() => setActiveTicket(null)}
        />
      )}

      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        clubs={clubs}
        events={events}
        announcements={announcements}
        setActiveTab={setActiveTab}
        onSelectEvent={(evt) => {
          setSelectedEventModal(evt);
          setActiveTab('events');
        }}
        onSelectWing={handleSelectWingFromHome}
        onSelectAnnouncement={(ann) => {
          setSelectedNoticeModal(ann);
          setActiveTab('announcements');
        }}
      />

      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
