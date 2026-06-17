import { useState } from 'react';
import { Booth } from '@/types/booth';
import styles from './BoothDetail.module.scss';

interface BoothDetailProps {
  booth: Booth;
}

export default function BoothDetail({ booth }: BoothDetailProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <h1 className={styles.title}>{booth.id >= 21 ? `🏝️ 무인도 ${booth.id - 20}` : `부스 ${booth.id}`} {booth.name}</h1>
        <p className={styles.subtitle}>{booth.subtitle}</p>
      </header>

      <div className={styles.imageWrapper}>
        {imgError ? (
          <div className={styles.placeholder}>
            <span>{booth.id >= 21 ? `무인도 ${booth.id - 20}` : `부스 ${booth.id}`} 이미지</span>
          </div>
        ) : (
          <img
            src={booth.image}
            alt={`${booth.id >= 21 ? `무인도 ${booth.id - 20}` : `부스 ${booth.id}`} ${booth.name}`}
            className={styles.image}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>게임 방식</h2>
          <p className={styles.sectionText}>{booth.method}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>승리 조건</h2>
          <p className={styles.sectionText}>{booth.winCondition}</p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>점령 포인트</h2>
          <p className={styles.sectionText}>{booth.conquestPoints}</p>
        </section>
      </div>
    </article>
  );
}
