import { useState, useRef, useCallback } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import Layout from '@/components/Layout';
import { Booth } from '@/types/booth';
import { getAllBooths } from '@/lib/db';
import styles from '@/styles/RulebookPage.module.scss';
import fs from 'fs';
import path from 'path';

interface RulebookPageProps {
  booths: Booth[];
  ruleImages: string[];
}

export default function RulebookPage({ booths, ruleImages }: RulebookPageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentIndex(index);
  }, []);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }, []);

  const total = ruleImages.length;
  const progress = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  return (
    <>
      <Head>
        <title>오후게임 룰북 - 체육대회</title>
      </Head>
      <Layout booths={booths} activeId={-1}>
        <article className={styles.page}>
          <header className={styles.hero}>
            <span className={styles.heroBadge}>RULEBOOK</span>
            <h1 className={styles.heroTitle}>📕 오후 게임 룰북</h1>
            <p className={styles.heroSubtitle}>게임별 규칙을 한눈에 확인하세요</p>
          </header>

          {total === 0 ? (
            <div className={styles.empty}>
              <p>룰북 이미지가 준비 중입니다</p>
            </div>
          ) : (
            <div className={styles.viewer}>
              <div className={styles.toolbar}>
                <span className={styles.counter}>
                  <strong>{currentIndex + 1}</strong>
                  <span className={styles.counterSep}>/</span>
                  <span>{total}</span>
                </span>
                <span className={styles.hint}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  터치하면 크게 볼 수 있어요
                </span>
              </div>

              <div className={styles.carouselWrapper}>
                <button
                  className={`${styles.navButton} ${styles.navPrev}`}
                  onClick={() => scrollTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                  aria-label="이전"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <PhotoProvider>
                  <div
                    className={styles.carousel}
                    ref={scrollRef}
                    onScroll={handleScroll}
                  >
                    {ruleImages.map((src, i) => (
                      <div key={i} className={styles.slide}>
                        <PhotoView src={src}>
                          <Image
                            src={src}
                            alt={`룰북 ${i + 1}페이지`}
                            fill
                            sizes="100vw"
                            className={styles.slideImage}
                            style={{ cursor: 'zoom-in' }}
                            priority={i === 0}
                          />
                        </PhotoView>
                      </div>
                    ))}
                  </div>
                </PhotoProvider>

                <button
                  className={`${styles.navButton} ${styles.navNext}`}
                  onClick={() => scrollTo(currentIndex + 1)}
                  disabled={currentIndex === total - 1}
                  aria-label="다음"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </article>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<RulebookPageProps> = async () => {
  const booths = await getAllBooths();
  const staticDir = path.join(process.cwd(), 'public', 'static');
  const files = fs.readdirSync(staticDir);
  const ruleImages = files
    .filter(f => /^rule_\d+\.png$/i.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)![0]);
      const numB = parseInt(b.match(/\d+/)![0]);
      return numA - numB;
    })
    .map(f => `/static/${f}`);
  return { props: { booths, ruleImages }, revalidate: 60 };
};
