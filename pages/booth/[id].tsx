import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import BoothDetail from '@/components/BoothDetail';
import { Booth } from '@/types/booth';
import { getAllBooths, getBoothById } from '@/lib/db';

interface BoothPageProps {
  booth: Booth;
  booths: Booth[];
}

export default function BoothPage({ booth, booths }: BoothPageProps) {
  return (
    <>
      <Head>
        <title>{`${booth.id >= 21 ? `무인도 ${booth.id - 20}` : `게임 ${booth.id}`} ${booth.name} - 체육대회`}</title>
      </Head>
      <Layout booths={booths} activeId={booth.id}>
        <BoothDetail booth={booth} />
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const booths = await getAllBooths();
  const paths = booths.map((b) => ({
    params: { id: String(b.id) },
  }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<BoothPageProps> = async ({ params }) => {
  const booths = await getAllBooths();
  const booth = await getBoothById(Number(params?.id));

  if (!booth) {
    return { notFound: true };
  }

  return { props: { booth, booths }, revalidate: 60 };
};
