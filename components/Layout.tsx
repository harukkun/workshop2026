import { ReactNode } from 'react';
import NavBar from './NavBar';
import { Booth } from '@/types/booth';
import styles from './Layout.module.scss';

interface LayoutProps {
  children: ReactNode;
  booths: Booth[];
  activeId: number;
}

export default function Layout({ children, booths, activeId }: LayoutProps) {
  return (
    <div className={styles.container}>
      <NavBar booths={booths} activeId={activeId} />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
