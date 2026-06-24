import { useState, useMemo } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { Booth } from '@/types/booth';
import { getAllBooths } from '@/lib/db';
import styles from '@/styles/BattlePage.module.scss';

interface BattlePageProps {
  booths: Booth[];
}

const matchups = [
  { game: 1, name: '뒤뚱뒤뚱! 튜브 달리기', team1: 'E그룹 1팀', team2: 'N그룹 1팀' },
  { game: 2, name: '이심전심! 릴레이 그림 이어그리기', team1: 'E그룹 2팀', team2: 'N그룹 2팀' },
  { game: 3, name: '쉿! 몸으로 말해요', team1: 'E그룹 3팀', team2: 'N그룹 3팀' },
  { game: 4, name: '킹콩! 킹받는 콩 옮기기', team1: 'E그룹 4팀', team2: 'N그룹 4팀' },
  { game: 5, name: '엎어라 제쳐라! 카드 점령', team1: 'E그룹 5팀', team2: 'N그룹 5팀' },
  { game: 6, name: '초스피드! 손가락 이모티콘 챌린지', team1: 'E그룹 6팀', team2: 'N그룹 6팀' },
  { game: 7, name: '돕찾! 스피드 퀴즈 게임', team1: 'E그룹 7팀', team2: 'N그룹 7팀' },
  { game: 8, name: '동작그만! 딸.바.사 게임', team1: 'E그룹 8팀', team2: 'N그룹 8팀' },
  { game: 9, name: '조심! 파스타 협동 레이스', team1: 'C그룹 1팀', team2: 'A그룹 1팀' },
  { game: 10, name: '출발! 파이프 익스프레스!', team1: 'C그룹 2팀', team2: 'A그룹 2팀' },
  { game: 11, name: '초대형! 자이언트 젠가!', team1: 'C그룹 3팀', team2: 'A그룹 3팀' },
  { game: 12, name: '다같이 공 튕겨튕겨', team1: 'C그룹 4팀', team2: 'A그룹 4팀' },
  { game: 13, name: '풍당풍당! 탁구공 빙고', team1: 'C그룹 5팀', team2: 'R그룹 1팀' },
  { game: 14, name: '하나둘셋! 스피드 초성 퀴즈', team1: 'C그룹 6팀', team2: 'R그룹 2팀' },
  { game: 15, name: '눈치코치! 인간 제로게임', team1: 'C그룹 7팀', team2: 'R그룹 3팀' },
  { game: 16, name: '두근두근! 폭탄 돌리기', team1: 'C그룹 8팀', team2: 'R그룹 4팀' },
  { game: 17, name: '요리조리! 공을 모아라', team1: 'R그룹 5팀', team2: 'A그룹 5팀' },
  { game: 18, name: '버텨라! 철봉 오래 매달리기', team1: 'R그룹 6팀', team2: 'A그룹 6팀' },
  { game: 19, name: '찰떡같이! 속담 이어 말하기', team1: 'R그룹 7팀', team2: 'A그룹 7팀' },
  { game: 20, name: '끈적끈적! 손바닥 끈끈이 챌린지', team1: 'R그룹 8팀', team2: 'A그룹 8팀' },
];

const groups = ['E', 'N', 'C', 'A', 'R'] as const;
const teamNumbers = [1, 2, 3, 4, 5, 6, 7, 8] as const;

function buildQuery(group: string | null, team: number | null): string | null {
  if (group && team) return `${group}그룹 ${team}팀`;
  if (group) return `${group}그룹`;
  if (team) return `${team}팀`;
  return null;
}

export default function BattlePage({ booths }: BattlePageProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

  const query = buildQuery(selectedGroup, selectedTeam);

  const filtered = useMemo(() => {
    if (!query) return matchups;
    return matchups.filter((m) => m.team1.includes(query) || m.team2.includes(query));
  }, [query]);

  const isFiltering = selectedGroup !== null || selectedTeam !== null;

  const isHighlighted = (teamStr: string) => {
    if (!query) return false;
    return teamStr.includes(query);
  };

  return (
    <>
      <Head>
        <title>첫 번째 점령전 대결팀 - 체육대회</title>
      </Head>
      <Layout booths={booths} activeId={-1}>
        <article className={styles.page}>
          <header className={styles.hero}>
            <span className={styles.heroBadge}>ROUND 1</span>
            <h1 className={styles.heroTitle}>첫 번째 점령전 !<br/>나의 대결 팀은?!</h1>
          </header>

          <div className={styles.filterBar}>
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>그룹</span>
              <div className={styles.filterChips}>
                {groups.map((g) => (
                  <button
                    key={g}
                    className={`${styles.chip} ${selectedGroup === g ? styles.chipActive : ''}`}
                    onClick={() => setSelectedGroup(selectedGroup === g ? null : g)}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>팀</span>
              <div className={styles.filterChips}>
                {teamNumbers.map((n) => (
                  <button
                    key={n}
                    className={`${styles.chip} ${selectedTeam === n ? styles.chipActive : ''}`}
                    onClick={() => setSelectedTeam(selectedTeam === n ? null : n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isFiltering && (
            <div className={styles.filterStatus}>
              <span className={styles.filterCount}>{filtered.length}개 매치</span>
              <button className={styles.resetBtn} onClick={() => { setSelectedGroup(null); setSelectedTeam(null); }}>
                초기화
              </button>
            </div>
          )}

          <div className={styles.matchupList}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>해당하는 대결이 없습니다</p>
              </div>
            ) : (
              filtered.map((m) => (
                <div key={m.game} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardBadge}>{String(m.game).padStart(2, '0')}</span>
                    <span className={styles.cardName}>{m.name}</span>
                  </div>
                  <div className={styles.arena}>
                    <div className={`${styles.teamSide} ${isHighlighted(m.team1) ? styles.teamHighlight : ''}`}>
                      <span className={styles.teamGroup}>{m.team1.split(' ')[0]}</span>
                      <span className={styles.teamNum}>{m.team1.split(' ')[1]}</span>
                    </div>
                    <div className={styles.vsDivider}>
                      <span className={styles.vsText}>VS</span>
                    </div>
                    <div className={`${styles.teamSide} ${isHighlighted(m.team2) ? styles.teamHighlight : ''}`}>
                      <span className={styles.teamGroup}>{m.team2.split(' ')[0]}</span>
                      <span className={styles.teamNum}>{m.team2.split(' ')[1]}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<BattlePageProps> = async () => {
  const booths = await getAllBooths();
  return { props: { booths }, revalidate: 60 };
};
