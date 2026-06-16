'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booth } from '@/types/booth';
import styles from './NavBar.module.scss';

interface NavBarProps {
  booths: Booth[];
  activeId: number;
}

export default function NavBar({ booths, activeId }: NavBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
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
        <h1 className={styles.topTitle}>엔카 x 엔무빙</h1>
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
            <p className={styles.logo}>체육대회</p>
            <p className={styles.logoSub}>게임 부스 안내</p>
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
          {booths.map((booth) => (
            <li key={booth.id}>
              <Link
                href={`/booth/${booth.id}`}
                className={`${styles.item} ${booth.id === activeId ? styles.active : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className={styles.title}>부스 {booth.id}</span>
                <span className={styles.subtitle}>{booth.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
