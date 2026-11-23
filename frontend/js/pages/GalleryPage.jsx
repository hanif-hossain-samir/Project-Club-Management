import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  X,
  Plus,
  Code2,
  ShieldCheck,
  Search,
  ArrowRight,
  ArrowLeft,
  Upload,
  FolderPlus,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useAuth } from '../auth.js';
import { api } from '../api.js';
import styles from './GalleryPage.module.css';

export const ALBUMS_LIST = [
  {
    slug: 'programming',
    title: 'Programming & Hackathons Album',
    clubId: 'computer_club',
    clubName: 'Computer Club (CUCC)',
    subtitle: 'Code Sprints, 24-Hour Hackathons & ICPC',
    description:
      'Coding sprints, 24-hour intra-varsity hackathons, algorithms competitions, software project expos, and ICPC bootcamps.',
    badge: 'Competitive Programming & Dev',
    icon: Code2,
    defaultCover:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80'
  },
  {
    slug: 'cyber_security',
    title: 'Cyber Security & CTF Album',
    clubId: 'computer_club',
    clubName: 'Computer Club (CUCC)',
    subtitle: 'National Cyber Drills & CTF Battlegrounds',
    description:
      'National cyber drill trophies, ethical hacking battlegrounds, capture-the-flag competitions, and security symposiums.',
    badge: 'Ethical Hacking & Defense',
    icon: ShieldCheck,
    defaultCover:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=80'
  },
  {
    slug: 'research',
    title: 'Research & Colloquium Album',
    clubId: 'computer_club',
    clubName: 'Computer Club (CUCC)',
    subtitle: 'IEEE Papers, Colloquiums & Poster Sessions',
    description:
      'IEEE conferences, undergraduate poster presentations, Bangla NLP breakthroughs, and scholarly paper reviews.',
    badge: 'Scholarly Research & Innovation',
    icon: Search,
    defaultCover:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80'
  }
];

export const GalleryPage = ({ gallery, onPhotoLiked, onPhotoAdded, onPhotosAdded }) => {
  const { user } = useAuth();

  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [likedMap, setLikedMap] = useState({});

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [targetWing, setTargetWing] = useState('programming');
  const [targetTitle, setTargetTitle] = useState('');
  const [targetEventName, setTargetEventName] = useState('');
  const [targetCaption, setTargetCaption] = useState('');
  const [photogName, setPhotogName] = useState(user?.name || '');

  const [uploadTab, setUploadTab] = useState('files');
  const [urlsInput, setUrlsInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [uploadErrorMsg, setUploadErrorMsg] = useState('');

  const handleLike = async (item, e) => {
    if (e) e.stopPropagation();
    if (likedMap[item.id]) return;

    setLikedMap((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await api.likeGalleryItem(item.id);
      if (res.success) {
        onPhotoLiked(item.id, res.likes);
        if (activeItem && activeItem.id === item.id) {
          setActiveItem({ ...activeItem, likes: res.likes });
        }
      }
    } catch {
      // ignore error
    }
  };

  const openUploadForAlbum = (albumSlug) => {
    setTargetWing(albumSlug);
    setUploadModalOpen(true);
    setUploadSuccessMsg('');
    setUploadErrorMsg('');
  };

  const handleFileChange = (e) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setUploadErrorMsg('');

    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedFiles((prev) => [
            ...prev,
            { name: file.name, dataUrl: event.target.result }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPhotosSubmit = async (e) => {
    e.preventDefault();
    setUploadErrorMsg('');

    const gatheredUrls = [];
    if (uploadTab === 'files') {
      selectedFiles.forEach((f) => gatheredUrls.push(f.dataUrl));
    } else {
      const lines = urlsInput
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      gatheredUrls.push(...lines);
    }

    if (gatheredUrls.length === 0) {
      setUploadErrorMsg('Please select at least one photo file or paste valid image URLs.');
      return;
    }

    setIsUploading(true);
    setUploadSuccessMsg('');

    try {
      const targetAlbumObj = ALBUMS_LIST.find((a) => a.slug === targetWing);
      const targetClubId = targetAlbumObj?.clubId || 'computer_club';

      const res = await api.createGalleryItem(
        {
          title: targetTitle || `${targetAlbumObj?.title || 'Album'} Photo`,
          caption: targetCaption,
          clubId: targetClubId,
          wingSlug: targetWing,
          eventName: targetEventName || targetAlbumObj?.title || 'Campus Moment',
          photogName: photogName || user?.name || 'City University Member',
          imageUrl: gatheredUrls[0],
          imageUrls: gatheredUrls
        },
        user?.id
      );

      setIsUploading(false);

      if (res.success) {
        if (res.items && res.items.length > 0) {
          if (onPhotosAdded) {
            onPhotosAdded(res.items);
          } else {
            res.items.forEach((item) => onPhotoAdded(item));
          }
        } else if (res.item) {
          onPhotoAdded(res.item);
        }

        setUploadSuccessMsg(
          `Successfully added ${gatheredUrls.length} photo${gatheredUrls.length > 1 ? 's' : ''} to ${targetAlbumObj?.title}!`
        );

        setSelectedFiles([]);
        setUrlsInput('');
        setTargetTitle('');
        setTargetCaption('');
        setTargetEventName('');

        setTimeout(() => {
          setUploadModalOpen(false);
          setUploadSuccessMsg('');
        }, 1200);
      } else {
        setUploadErrorMsg(res.message || 'Failed to add photos to album.');
      }
    } catch {
      setIsUploading(false);
      setUploadErrorMsg('Failed to add photos to album. Please check the URLs and try again.');
    }
  };

  const currentAlbumObj = selectedAlbum
    ? ALBUMS_LIST.find((a) => a.slug === selectedAlbum)
    : null;
  const currentAlbumPhotos = selectedAlbum
    ? gallery.filter((item) => item.wingSlug === selectedAlbum)
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className={styles.kicker}>City University Visual Archives</div>
          <h1 className={styles.title}>Campus Albums &amp; Visual Records</h1>
          <p className={styles.subtitle}>
            Explore dedicated photo albums for each university wing. Upload limitless memories from
            programming hackathons, CTFs, and research colloquiums.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (selectedAlbum) setTargetWing(selectedAlbum);
            setUploadModalOpen(true);
            setUploadSuccessMsg('');
            setUploadErrorMsg('');
          }}
          className={styles.addPhotoMainBtn}
        >
          <FolderPlus style={{ width: '1rem', height: '1rem' }} />
          <span>+ Add Photos to Album</span>
        </button>
      </div>

      {selectedAlbum === null && (
        <div className={styles.dirBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#737373' }}>
              CUCC Archives:
            </span>
            <div className={styles.archiveChip}>
              <span>Computer Club (CUCC) · All 3 Specialized Wings</span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#737373', fontWeight: 500 }}>
            Showing 3 official technological albums
          </div>
        </div>
      )}

      {selectedAlbum && currentAlbumObj && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button type="button" onClick={() => setSelectedAlbum(null)} className={styles.backBtn}>
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
              <span>← Back to All Albums</span>
            </button>

            <div className={styles.albumHeroBanner}>
              <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '42rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem', backgroundColor: '#D40000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <currentAlbumObj.icon style={{ width: '1.25rem', height: '1.25rem' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fecaca', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {currentAlbumObj.clubName}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#D40000', color: '#ffffff' }}>
                      {currentAlbumPhotos.length} Photo{currentAlbumPhotos.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                    {currentAlbumObj.title}
                  </h2>
                  <p style={{ color: '#d4d4d4', fontSize: '0.875rem', lineHeight: 1.625 }}>
                    {currentAlbumObj.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => openUploadForAlbum(currentAlbumObj.slug)}
                    className={styles.addPhotoMainBtn}
                  >
                    <Plus style={{ width: '1rem', height: '1rem' }} />
                    <span>+ Add Photos to this Album</span>
                  </button>
                  <span style={{ fontSize: '11px', color: '#a3a3a3', textAlign: 'center' }}>
                    Unlimited uploads supported
                  </span>
                </div>
              </div>
            </div>
          </div>

          {currentAlbumPhotos.length === 0 ? (
            <div className={styles.emptyAlbum}>
              <div style={{ width: '3.5rem', height: '3.5rem', margin: '0 auto', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#D40000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon style={{ width: '1.75rem', height: '1.75rem' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>No photos in this album yet</h3>
                <p style={{ fontSize: '0.875rem', color: '#737373', maxWidth: '28rem', margin: '0.25rem auto 0' }}>
                  Be the first to add memories, competition photos, or victory celebrations to this
                  album!
                </p>
              </div>
              <button
                type="button"
                onClick={() => openUploadForAlbum(currentAlbumObj.slug)}
                className={styles.addPhotoMainBtn}
                style={{ alignSelf: 'center' }}
              >
                <Plus style={{ width: '1rem', height: '1rem' }} />
                <span>Add First Photo</span>
              </button>
            </div>
          ) : (
            <div className={styles.photosGrid}>
              {currentAlbumPhotos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item)}
                  className={styles.photoCard}
                >
                  <div className={styles.photoFrame}>
                    <img src={item.imageUrl} alt={item.title} className={styles.photoImg} />
                    <div className={styles.coverScrim} />

                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                      <span style={{ padding: '0.125rem 0.625rem', borderRadius: '0.25rem', backgroundColor: '#D40000', color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <currentAlbumObj.icon style={{ width: '0.75rem', height: '0.75rem', color: '#fde68a' }} />
                        <span>{item.wingSlug.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleLike(item, e)}
                      className={`${styles.likeBtn} ${likedMap[item.id] ? styles.likeBtnActive : ''}`}
                      title="Cheer and like this activity photo"
                    >
                      <Heart
                        style={{
                          width: '1rem',
                          height: '1rem',
                          fill: likedMap[item.id] ? 'currentColor' : 'none'
                        }}
                      />
                    </button>

                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', right: '0.75rem', color: '#ffffff' }}>
                      <p style={{ fontSize: '10px', color: '#fcd34d', fontWeight: 600 }}>
                        {item.eventName}
                      </p>
                      <h3 className="line-clamp-1" style={{ fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.375 }}>
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <p className="line-clamp-2" style={{ color: '#525252' }}>
                      {item.caption || `${item.title} at City University.`}
                    </p>

                    <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#737373' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar style={{ width: '0.75rem', height: '0.75rem' }} /> {item.date}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: '#dc2626' }}>
                        <Heart style={{ width: '0.875rem', height: '0.875rem', fill: 'currentColor' }} />{' '}
                        {item.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedAlbum === null && (
        <div className={styles.albumsGrid}>
          {ALBUMS_LIST.map((album) => {
            const albumPhotos = gallery.filter((item) => item.wingSlug === album.slug);
            const coverUrl = albumPhotos.length > 0 ? albumPhotos[0].imageUrl : album.defaultCover;
            const IconComp = album.icon;

            return (
              <div
                key={album.slug}
                onClick={() => setSelectedAlbum(album.slug)}
                className={styles.albumCard}
              >
                <div className={styles.coverBox}>
                  <img src={coverUrl} alt={album.title} className={styles.coverImg} />
                  <div className={styles.coverScrim} />

                  <div className={styles.clubPill}>{album.clubName}</div>
                  <div className={styles.countPill}>
                    {albumPhotos.length} Photo{albumPhotos.length === 1 ? '' : 's'}
                  </div>

                  <div className={styles.coverCaption}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem', backgroundColor: '#D40000', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp style={{ width: '1rem', height: '1rem' }} />
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1.25 }}>
                        {album.title}
                      </h3>
                    </div>
                    <p className="line-clamp-1" style={{ fontSize: '0.75rem', color: '#d4d4d4' }}>
                      {album.subtitle}
                    </p>
                  </div>
                </div>

                <div className={styles.albumBody}>
                  <p className="line-clamp-2" style={{ fontSize: '0.75rem', color: '#737373', lineHeight: 1.625 }}>
                    {album.description}
                  </p>

                  <div className={styles.albumFooter}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openUploadForAlbum(album.slug);
                      }}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        cursor: 'pointer',
                        padding: '0.25rem 0'
                      }}
                    >
                      <Plus style={{ width: '0.875rem', height: '0.875rem', color: '#D40000' }} />
                      <span>+ Add Photos</span>
                    </button>

                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#D40000' }}>
                      <span>Open Album</span>
                      <ArrowRight style={{ width: '0.875rem', height: '0.875rem' }} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {uploadModalOpen && (
        <div className={styles.modalBackdrop} onClick={() => setUploadModalOpen(false)}>
          <div className={styles.uploadModalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                setUploadModalOpen(false);
                setSelectedFiles([]);
                setUploadSuccessMsg('');
                setUploadErrorMsg('');
              }}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                padding: '0.5rem',
                borderRadius: '9999px',
                backgroundColor: '#f5f5f5',
                color: '#525252',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>

            <div>
              <div className={styles.kicker} style={{ marginBottom: '0.5rem' }}>
                <Upload style={{ width: '0.875rem', height: '0.875rem' }} />
                <span>Limitless Photo Addition</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                Add Photos to Album
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#737373' }}>
                Upload photos from your computer or phone, or paste multiple image URLs with no
                limit.
              </p>
            </div>

            {uploadSuccessMsg && (
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 style={{ width: '1rem', height: '1rem', color: '#10b981', flexShrink: 0 }} />
                <span>{uploadSuccessMsg}</span>
              </div>
            )}

            {uploadErrorMsg && (
              <div style={{ padding: '0.875rem', borderRadius: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle style={{ width: '1rem', height: '1rem', color: '#dc2626', flexShrink: 0 }} />
                <span>{uploadErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddPhotosSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                  Select Target Album *
                </label>
                <select
                  value={targetWing}
                  onChange={(e) => setTargetWing(e.target.value)}
                  className="cuec-select"
                >
                  <option value="programming">💻 Programming &amp; Hackathons Album (CUCC Coding)</option>
                  <option value="cyber_security">🛡️ Cyber Security &amp; CTF Album (CUCC CTFs, Drills)</option>
                  <option value="research">🔬 Research &amp; Colloquium Album (CUCC IEEE, AI Labs)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                  Photo Source *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', padding: '0.25rem', backgroundColor: '#f5f5f5', borderRadius: '0.75rem', marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setUploadTab('files')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      backgroundColor: uploadTab === 'files' ? '#ffffff' : 'transparent',
                      color: uploadTab === 'files' ? '#D40000' : '#525252',
                      boxShadow: uploadTab === 'files' ? 'var(--shadow-xs)' : 'none'
                    }}
                  >
                    <Upload style={{ width: '0.875rem', height: '0.875rem' }} />
                    <span>Upload Files from Device</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadTab('urls')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      backgroundColor: uploadTab === 'urls' ? '#ffffff' : 'transparent',
                      color: uploadTab === 'urls' ? '#D40000' : '#525252',
                      boxShadow: uploadTab === 'urls' ? 'var(--shadow-xs)' : 'none'
                    }}
                  >
                    <ImageIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                    <span>Paste Image URLs</span>
                  </button>
                </div>

                {uploadTab === 'files' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label className={styles.dropzone}>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#D40000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Upload style={{ width: '1.25rem', height: '1.25rem' }} />
                        </div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          Click to select photos or drag &amp; drop
                        </p>
                        <p style={{ fontSize: '11px', color: '#737373' }}>
                          Select 1, 5, 20+ photos at once (JPG, PNG, WebP)
                        </p>
                      </div>
                    </label>

                    {selectedFiles.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                          <span>
                            {selectedFiles.length} photo{selectedFiles.length === 1 ? '' : 's'} ready to
                            add:
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles([])}
                            style={{ color: '#D40000', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Clear all
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', maxHeight: '9rem', overflowY: 'auto', padding: '0.25rem', backgroundColor: '#f5f5f5', borderRadius: '0.75rem' }}>
                          {selectedFiles.map((file, idx) => (
                            <div
                              key={idx}
                              style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #d4d4d4' }}
                            >
                              <img
                                src={file.dataUrl}
                                alt={file.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <button
                                type="button"
                                onClick={() => removeSelectedFile(idx)}
                                style={{ position: 'absolute', top: '0.25rem', right: '0.25rem', padding: '0.25rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.7)', color: '#ffffff', cursor: 'pointer' }}
                              >
                                <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {uploadTab === 'urls' && (
                  <div>
                    <textarea
                      value={urlsInput}
                      onChange={(e) => setUrlsInput(e.target.value)}
                      rows={3}
                      placeholder="Paste image URLs (one per line, e.g. https://... or /assets/...)"
                      className="cuec-textarea font-mono"
                    />
                    <p style={{ fontSize: '10px', color: '#737373', marginTop: '0.25rem' }}>
                      Paste as many URLs as you like, one per line. Limitless additions supported.
                    </p>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Event / Occasion Name
                  </label>
                  <input
                    type="text"
                    value={targetEventName}
                    onChange={(e) => setTargetEventName(e.target.value)}
                    placeholder="e.g. Intra Hackathon 2026"
                    className="cuec-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Photo Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    placeholder="e.g. Trophy Celebration Moment"
                    className="cuec-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={targetCaption}
                    onChange={(e) => setTargetCaption(e.target.value)}
                    placeholder="Brief highlight description"
                    className="cuec-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Photographer Credit
                  </label>
                  <input
                    type="text"
                    value={photogName}
                    onChange={(e) => setPhotogName(e.target.value)}
                    placeholder="e.g. CU Media Wing"
                    className="cuec-input"
                  />
                </div>
              </div>

              <div style={{ paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="cuec-btn-primary"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.875rem' }}
                >
                  <Plus style={{ width: '1rem', height: '1rem' }} />
                  <span>{isUploading ? 'Uploading Photos...' : 'Save & Add Photos to Album'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeItem && (
        <div className={styles.modalBackdrop} onClick={() => setActiveItem(null)}>
          <div className={styles.lightboxCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                zIndex: 20,
                padding: '0.5rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>

            <div style={{ position: 'relative', aspectRatio: '16/10', backgroundColor: '#000000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={activeItem.imageUrl}
                alt={activeItem.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#D40000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {activeItem.wingSlug.replace('_', ' ')} · {activeItem.eventName}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                    {activeItem.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleLike(activeItem)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.875rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: likedMap[activeItem.id] ? '#fef2f2' : '#f5f5f5',
                    color: likedMap[activeItem.id] ? '#D40000' : '#404040',
                    border: likedMap[activeItem.id] ? '1px solid #fecaca' : '1px solid transparent'
                  }}
                >
                  <Heart
                    style={{
                      width: '1rem',
                      height: '1rem',
                      fill: likedMap[activeItem.id] ? 'currentColor' : 'none',
                      color: likedMap[activeItem.id] ? '#D40000' : 'inherit'
                    }}
                  />
                  <span>{activeItem.likes}</span>
                </button>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#737373' }}>
                {activeItem.caption || `${activeItem.title} at City University.`}
              </p>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#737373' }}>
                <span>Photographer: {activeItem.photogName || 'CU Media'}</span>
                <span>Captured on {activeItem.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
