import Link from 'next/link';
import { Booth } from '@/types/booth';
import styles from './NavBar.module.scss';

interface NavBarProps {
  booths: Booth[];
  activeId: number;
}

export default function NavBar({ booths, activeId }: NavBarProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.header}>
        <h1 className={styles.logo}>체육대회</h1>
        <p className={styles.logoSub}>게임 부스 안내</p>
      </div>
      <ul className={styles.list}>
        {booths.map((booth) => (
          <li key={booth.id}>
            <Link
              href={`/booth/${booth.id}`}
              className={`${styles.item} ${booth.id === activeId ? styles.active : ''}`}
            >
              <span className={styles.title}>부스 {booth.id}</span>
              <span className={styles.subtitle}>{booth.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
