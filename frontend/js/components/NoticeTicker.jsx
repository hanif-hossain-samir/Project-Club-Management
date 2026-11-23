import React from 'react';
import { Flame, Pin } from 'lucide-react';
import styles from './NoticeTicker.module.css';

export function NoticeTicker({ announcements, onSelectNotice }) {
  const sorted = [...announcements].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const urgentOrPinned = sorted.filter(
    (a) => a.pinned || a.priority === 'urgent' || a.priority === 'competition'
  );
  const items = urgentOrPinned.length > 0 ? urgentOrPinned : sorted.slice(0, 4);

  if (items.length === 0) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.badgeWrap}>
          <span className={styles.officialBadge}>
            <Flame style={{ width: '0.75rem', height: '0.75rem', color: '#fcd34d' }} />
            Official Notice
          </span>
        </div>

        <div className={`${styles.scroller} no-scrollbar`}>
          {items.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => onSelectNotice(item)}
              className={styles.itemBtn}
            >
              {item.pinned && (
                <span className={styles.pinTag}>
                  <Pin style={{ width: '0.625rem', height: '0.625rem', fill: 'currentColor' }} /> Pinned
                </span>
              )}
              {!item.pinned && item.priority === 'urgent' && (
                <span className={styles.urgentTag}>Urgent</span>
              )}
              {!item.pinned && item.priority === 'competition' && (
                <span className={styles.contestTag}>Contest</span>
              )}
              <span className={styles.itemTitle}>{item.title}</span>
              {idx < items.length - 1 && <span className={styles.separator}>•</span>}
            </button>
          ))}
        </div>

        <div className={styles.updatedWrap}>
          <span className={styles.updatedText}>Updated Today</span>
        </div>
      </div>
    </div>
  );
}
