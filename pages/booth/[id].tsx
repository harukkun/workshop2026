import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Layout from '@/components/Layout';
import BoothDetail from '@/components/BoothDetail';
import { Booth } from '@/types/booth';
import boothsData from '@/data/booths.json';

interface BoothPageProps {
  booth: Booth;
  booths: Booth[];
}

export default function BoothPage({ booth, booths }: BoothPageProps) {
  return (
    <>
      <Head>
        <title>{`부스 ${booth.id} ${booth.name} - 체육대회`}</title>
      </Head>
      <Layout booths={booths} activeId={booth.id}>
        <BoothDetail booth={booth} />
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = boothsData.map((b) => ({
    params: { id: String(b.id) },
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<BoothPageProps> = async ({ params }) => {
  const booths = boothsData as Booth[];
  const booth = booths.find((b) => b.id === Number(params?.id));

  if (!booth) {
    return { notFound: true };
  }

  return { props: { booth, booths } };
};
