'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Booth } from '@/types/booth';
import styles from './NavBar.module.scss';

interface NavBarProps {
  booths: Booth[];
  activeId: number;
}

export default function NavBar({ booths, activeId }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeItemRef = useRef<HTMLAnchorElement>(null);
  const router = useRouter();
  const isBattlePage = router.pathname === '/battle';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'center' });
    }
  }, [isOpen]);

  return (
    <>
      <header className={styles.topBar}>
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(true)}
          aria-label="메뉴 열기"
        >
          <span />
          <span />
          <span />
        </button>
        <img src="/logo.png" alt="로고" className={styles.topLogo} />
      </header>

      {isOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}

      <nav className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <div className={styles.drawerHeader}>
          <div>
            <p className={styles.logo}>엔무빙 체육대회</p>
            <p className={styles.logoSub}>게임 안내</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="메뉴 닫기"
          >
            ✕
          </button>
        </div>
        <ul className={styles.list}>
          <li>
            <div className={styles.opsDivider}>
              <span>📋 운영</span>
            </div>
            <Link
              href="/battle"
              className={`${styles.item} ${styles.opsItem} ${isBattlePage ? styles.active : ''}`}
              onClick={() => setIsOpen(false)}
              ref={isBattlePage ? activeItemRef : null}
            >
              <span className={styles.title}>[필독] 첫번째 대결팀</span>
            </Link>
          </li>
          {booths.map((booth, idx) => (
            <li key={booth.id}>
              {booth.id === 1 && (
                <div className={styles.boothDivider}>
                  <span>🎮 게임</span>
                </div>
              )}
              {booth.id === 21 && idx > 0 && (
                <div className={styles.islandDivider}>
                  <span>🏝️ 무인도 탈출</span>
                </div>
              )}
              <Link
                href={`/booth/${booth.id}`}
                className={`${styles.item} ${booth.id >= 21 ? styles.island : ''} ${booth.id === activeId ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
                ref={booth.id === activeId ? activeItemRef : null}
              >
                <span className={styles.title}>{booth.id >= 21 ? `무인도 ${booth.id - 20}` : `게임 ${booth.id}`}</span>
                <span className={styles.subtitle}>{booth.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
