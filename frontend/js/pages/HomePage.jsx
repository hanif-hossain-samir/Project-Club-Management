import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react';
import { WingIcon } from '../components/WingIcon.jsx';
import styles from './HomePage.module.css';

const CAMPUS_SLIDES = [
  {
    url: '/assets/aistudio/1613373427632_b0f44fb6.jpg',
    title: 'City University Permanent Campus',
    subtitle: 'Khagan, Birulia, Savar · Lush academic quad & campus facilities',
    tag: 'Academic Campus'
  },
  {
    url: '/assets/aistudio/Cityuniversitynight_8d1ad3d9.png',
    title: 'Campus Life at Night',
    subtitle: 'Illuminated campus architecture & vibrant university environment',
    tag: 'Campus Night View'
  },
  {
    url: '/assets/aistudio/images__1__66268473.jpg',
    title: 'Top Ranking Private University',
    subtitle: 'Fostering excellence across technology, cultural & sports wings',
    tag: 'Academic Excellence'
  }
];

export const HomePage = ({ clubs, events, setActiveTab, onSelectEvent, onSelectWing }) => {
  const [interestedEventIds, setInterestedEventIds] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  useEffect(() => {
    if (isSliderHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAMPUS_SLIDES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isSliderHovered]);

  const cuccClub = clubs.find((c) => c.id === 'computer_club');
  const filteredWings = (cuccClub?.wings || []).filter(
    (w) => w.slug === 'programming' || w.slug === 'cyber_security' || w.slug === 'research'
  );

  const featuredEvents = events
    .filter((e) => e.clubId === 'computer_club')
    .slice(0, 3)
    .map((evt) => {
      const parts = (evt.date || '').split('-');
      const day = parts[2] || '08';
      const month = parts[1] === '11' ? 'NOV' : parts[1] === '12' ? 'DEC' : 'NOV';
      return {
        id: evt.id,
        day,
        month,
        kicker:
          evt.kicker ||
          `${(evt.category || 'EVENT').toUpperCase()} · ${(evt.wingSlug || '').replace('_', ' ').toUpperCase()}`,
        title: evt.title,
        description: `${evt.description} · ${evt.time} · ${evt.venue}`,
        wingSlug: evt.wingSlug,
        eventRef: evt
      };
    });

  const handleInterestClick = (eventItem) => {
    if (!interestedEventIds.includes(eventItem.id)) {
      setInterestedEventIds((prev) => [...prev, eventItem.id]);
    }
    if (eventItem.eventRef) {
      onSelectEvent(eventItem.eventRef);
    } else {
      setActiveTab('events');
    }
  };

  const scrollToClubs = () => {
    const el = document.getElementById('clubs-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('clubs');
    }
  };

  const scrollToEvents = () => {
    const el = document.getElementById('events-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveTab('events');
    }
  };

  const handleExploreClub = (wingSlug) => {
    const targetWing = clubs.flatMap((c) => c.wings).find((w) => w.slug === wingSlug);
    if (targetWing) {
      onSelectWing(targetWing);
    } else {
      setActiveTab('clubs');
    }
  };

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroLeft}>
              <a
                href="https://cityuniversity.ac.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.kickerPill}
                title="Click logo to visit City University official website: https://cityuniversity.ac.bd/"
              >
                <div className={styles.kickerLogoBox}>
                  <img
                    src="/city-university-logo.jpg"
                    alt="City University Crest"
                    className={styles.kickerLogoImg}
                  />
                </div>
                <span className={styles.kickerText}>YOUR CAMPUS, YOUR COMMUNITY</span>
                <ExternalLink className={styles.kickerExternal} />
              </a>

              <div className={styles.headlineGroup}>
                <h1 className={styles.headlineMain}>City University</h1>
                <h2 className={styles.headlineAccent}>Events &amp; Clubs</h2>
              </div>

              <p className={styles.heroSub}>
                Discover clubs, join the conversation, and make campus life unforgettable. There’s
                a place for every passion at City University.
              </p>

              <div className={styles.ctaRow}>
                <button type="button" onClick={scrollToClubs} className={styles.primaryCta}>
                  <span>Explore clubs</span>
                  <span style={{ fontSize: '1rem' }}>↗</span>
                </button>

                <button type="button" onClick={scrollToEvents} className={styles.secondaryCta}>
                  <span>Upcoming events</span>
                </button>
              </div>

              <div className={styles.taglineBlock}>
                <p className={styles.taglineLead}>One campus. Many communities.</p>
                <p className={styles.taglineSub}>Learn, lead, create, and connect.</p>
              </div>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.orbitBg}>
                <div className={styles.orbitCircle} />
              </div>

              <div className={styles.sparkleTop}>✦</div>
              <div className={styles.sparkleBottom}>✦</div>

              <div
                className={styles.sliderCard}
                onMouseEnter={() => setIsSliderHovered(true)}
                onMouseLeave={() => setIsSliderHovered(false)}
              >
                <div className={styles.slideViewport}>
                  {CAMPUS_SLIDES.map((slide, idx) => {
                    const isActive = idx === currentSlide;
                    return (
                      <div
                        key={slide.url}
                        className={`${styles.slideLayer} ${isActive ? styles.slideActive : styles.slideInactive}`}
                      >
                        <img src={slide.url} alt={slide.title} className={styles.slideImg} />
                        <div className={styles.slideScrim} />
                        <div className={styles.slideTint} />
                      </div>
                    );
                  })}

                  <div className={styles.slideTopBar}>
                    <div className={styles.slideBadge}>
                      <span className={styles.slidePulseDot} />
                      <span>{CAMPUS_SLIDES[currentSlide].tag}</span>
                    </div>

                    <div className={styles.slideCounter}>
                      <span className={styles.slideCounterNum}>0{currentSlide + 1}</span>
                      <span style={{ opacity: 0.4 }}>/</span>
                      <span style={{ opacity: 0.7 }}>0{CAMPUS_SLIDES.length}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlide((prev) => (prev - 1 + CAMPUS_SLIDES.length) % CAMPUS_SLIDES.length)
                    }
                    className={`${styles.slideArrow} ${styles.slidePrev}`}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % CAMPUS_SLIDES.length)}
                    className={`${styles.slideArrow} ${styles.slideNext}`}
                    aria-label="Next slide"
                  >
                    <ChevronRight style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>

                  <div className={styles.slideBottom}>
                    <div>
                      <h3 className={styles.slideTitle}>{CAMPUS_SLIDES[currentSlide].title}</h3>
                      <p className={styles.slideSubtitle}>{CAMPUS_SLIDES[currentSlide].subtitle}</p>
                    </div>

                    <div className={styles.progressBars}>
                      {CAMPUS_SLIDES.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentSlide(idx)}
                          className={styles.progressTrack}
                          aria-label={`Jump to slide ${idx + 1}`}
                        >
                          <div
                            className={
                              idx === currentSlide
                                ? styles.progressFillActive
                                : idx < currentSlide
                                ? styles.progressFillDone
                                : styles.progressFillIdle
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.sliderFooter}>
                  <div className={styles.sliderLocRow}>
                    <span className={styles.onlineDot} />
                    <span className={styles.sliderLocText}>City University Campus · Dhaka</span>
                  </div>
                  <div className={styles.sliderActions}>
                    <a
                      href="https://cityuniversity.ac.bd/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.varsityPillLink}
                      title="Visit official varsity website: https://cityuniversity.ac.bd/"
                    >
                      <span>cityuniversity.ac.bd</span>
                      <ExternalLink style={{ width: '0.75rem', height: '0.75rem' }} />
                    </a>
                    <button
                      type="button"
                      onClick={scrollToClubs}
                      aria-label="Scroll to clubs"
                      className={styles.jumpArrowBtn}
                      title="Explore Clubs & Wings"
                    >
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>↗</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="clubs-section" className={styles.sectionBlock}>
        <div className={styles.container}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <div className={styles.sectionBadge}>City University Computer Club (CUCC)</div>
              <h2 className={styles.sectionTitle}>3 Specialized Technological Wings</h2>
            </div>
            <p className={styles.sectionSubtitle}>
              Lead by Controller Tanvir Ahmed across competitive programming, cybersecurity
              defense, and scientific research.
            </p>
          </div>

          <div className={styles.wingsGrid}>
            {filteredWings.map((wing) => (
              <div key={wing.id} className={styles.wingCard}>
                <div className={styles.wingCardBody}>
                  <div className={styles.wingIconBox}>
                    <WingIcon slug={wing.slug} style={{ width: '1.5rem', height: '1.5rem' }} />
                  </div>

                  <div>
                    <p className={styles.wingKicker}>{wing.kicker}</p>
                    <h3 className={styles.wingName}>{wing.name}</h3>
                  </div>

                  <p className={styles.wingDesc}>{wing.shortDesc}</p>
                </div>

                <div className={styles.exploreWingWrap}>
                  <button
                    type="button"
                    onClick={() => handleExploreClub(wing.slug)}
                    className={styles.exploreWingBtn}
                  >
                    <span>Explore this club</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="events-section" className={styles.eventsSection}>
        <div className={styles.container}>
          <div className={styles.eventsHeader}>
            <div>
              <p className={styles.saveDate}>SAVE THE DATE</p>
              <h2 className={styles.eventsTitle}>
                What’s happening <span className={styles.eventsAccent}>next?</span>
              </h2>
            </div>

            <p className={styles.eventsSub}>
              Get involved in workshops, competitions, celebrations, and experiences happening
              around campus.
            </p>
          </div>

          <div className={styles.eventStack}>
            {featuredEvents.map((item) => {
              const isInterested = interestedEventIds.includes(item.id);
              return (
                <div key={item.id} className={styles.eventRowCard}>
                  <div className={styles.eventLeft}>
                    <div className={styles.dateBadge}>
                      <span className={styles.dateDay}>{item.day}</span>
                      <span className={styles.dateMonth}>{item.month}</span>
                    </div>

                    <div>
                      <p className={styles.eventKicker}>{item.kicker}</p>
                      <h3 className={styles.eventTitle}>{item.title}</h3>
                      <p className={styles.eventDesc}>{item.description}</p>
                    </div>
                  </div>

                  <div className={styles.interestWrap}>
                    <button
                      type="button"
                      onClick={() => handleInterestClick(item)}
                      className={`${styles.interestBtn} ${isInterested ? styles.interestBtnActive : ''}`}
                    >
                      <span>{isInterested ? 'Registered' : "I'm interested"}</span>
                      <span>↗</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.viewCalWrap}>
            <button type="button" onClick={() => setActiveTab('events')} className={styles.viewCalBtn}>
              <span>View full semester calendar &amp; all events</span>
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>
      </section>

      <section className={styles.charterSection}>
        <div className={styles.container}>
          <div className={styles.charterBox}>
            <div className={styles.charterContent}>
              <div className={styles.charterLogoBox}>
                <img
                  src="/city-university-logo.jpg"
                  alt="City University Official Logo"
                  className={styles.charterLogoImg}
                />
              </div>
              <div>
                <div className={styles.charterTitleRow}>
                  <h3 className={styles.charterTitle}>City University</h3>
                  <span className={styles.charterTag}>Official Central Portal</span>
                </div>
                <p className={styles.charterDesc}>
                  "...creating a culture of excellence" · City University Computer Club (CUCC)
                  empowering 3 specialized wings in software, cybersecurity defense, and scientific
                  research.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
