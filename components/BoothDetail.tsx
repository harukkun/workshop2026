import { useState, useMemo } from 'react';
import Image from 'next/image';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { Booth } from '@/types/booth';
import styles from './BoothDetail.module.scss';

interface BoothDetailProps {
  booth: Booth;
}

interface MethodStep {
  text: string;
  notes: string[];
}

function parseMethod(method: string): MethodStep[] | null {
  const lines = method.split('\n');
  const steps: MethodStep[] = [];
  let current: MethodStep | null = null;

  for (const line of lines) {
    if (/^\d+\./.test(line)) {
      current = { text: line.replace(/^\d+\.\s*/, ''), notes: [] };
      steps.push(current);
    } else if (line.startsWith('※') && current) {
      current.notes.push(line);
    }
  }

  return steps.length > 0 ? steps : null;
}

export default function BoothDetail({ booth }: BoothDetailProps) {
  const [imgError, setImgError] = useState(false);
  const methodSteps = useMemo(() => parseMethod(booth.method), [booth.method]);

  return (
    <article className={styles.detail}>
      <header className={styles.header}>
        <h1 className={styles.title}>{booth.id >= 21 ? `🏝️ [무인도 ${booth.id - 20}] 게임 - ` : `게임 ${booth.id}`} {booth.name}</h1>
        <p className={styles.subtitle}>{booth.subtitle}</p>
      </header>

      <div className={styles.imageWrapper}>
        {imgError ? (
          <div className={styles.placeholder}>
            <span>{booth.id >= 21 ? `무인도 ${booth.id - 20}` : `게임 ${booth.id}`} 이미지</span>
          </div>
        ) : (
          <PhotoProvider>
            <PhotoView src={booth.image}>
              <div className={styles.imageContainer} style={{ cursor: 'zoom-in' }}>
                <Image
                  src={booth.image}
                  alt={`${booth.id >= 21 ? `무인도 ${booth.id - 20} 설명 이미지` : `게임 ${booth.id} 설명 이미지`}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 600px"
                  className={styles.image}
                  onError={() => setImgError(true)}
                />
              </div>
            </PhotoView>
          </PhotoProvider>
        )}
      </div>

      <div className={styles.sections}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>참여 / 인원 구성</h2>
          <ul className={styles.conditionList}>
            {booth.participants.split('\n').map((line, i) => (
              <li key={i} className={styles.conditionItem}>{line}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>게임 방식</h2>
          {methodSteps ? (
            <ol className={styles.methodList}>
              {methodSteps.map((step, i) => (
                <li key={i} className={styles.methodItem}>
                  <span>{step.text}</span>
                  {step.notes.length > 0 && (
                    <ul className={styles.noteList}>
                      {step.notes.map((note, j) => (
                        <li key={j} className={styles.noteItem}>{note}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.sectionText}>{booth.method}</p>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>승리 조건</h2>
          {booth.winCondition.includes('\n') ? (
            <ul className={styles.conditionList}>
              {booth.winCondition.split('\n').map((line, i) => (
                <li key={i} className={styles.conditionItem}>{line}</li>
              ))}
            </ul>
          ) : (
            <p className={styles.sectionText}>{booth.winCondition}</p>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>점령 포인트</h2>
          <p className={styles.sectionText}>{booth.conquestPoints}</p>
        </section>

        {booth.coinCondition && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>코인 획득 조건</h2>
            <ul className={styles.conditionList}>
              {booth.coinCondition.split('\n').map((line, i) => (
                <li key={i} className={styles.conditionItem}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {booth.preparation && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>게임 전 준비사항</h2>
            <ul className={styles.conditionList}>
              {booth.preparation.split('\n').map((line, i) => (
                <li key={i} className={styles.conditionItem}>{line}</li>
              ))}
            </ul>
          </section>
        )}

        {booth.postCheck && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>게임 종료 후 체크</h2>
            <ul className={styles.conditionList}>
              {booth.postCheck.split('\n').map((line, i) => (
                <li key={i} className={styles.conditionItem}>{line}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
