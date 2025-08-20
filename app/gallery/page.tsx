'use client';
import { useEffect, useState } from 'react';
import { fetchRecentTokenIds, fetchYourTokens } from '@/src/BlockchainServerAPI';
import Loading from '@/components/Loading/Loading';
import Artwork from '@/components/Artwork/Artwork';
import { Grid, SimpleGrid, Tabs, Text, rem } from '@mantine/core';
import { handleError } from '@/src/ErrorHandler';
import { IconArtboard, IconHeart } from '@tabler/icons-react';
import styles from './GalleryPage.module.css';
import Link from 'next/link';
import { useAccount } from 'wagmi';

function PageNavigator({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (fn: (p: number) => number) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '0.75rem',
        marginBottom: '0.75rem',
      }}
    >
      <button
        onClick={() => setPage((p) => Math.max(0, p - 1))}
        disabled={page === 0}
        style={{ marginRight: '1rem', width: '120px', minWidth: '120px' }}
      >
        Previous
      </button>
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        disabled={page >= totalPages - 1}
        style={{ marginLeft: '1rem', width: '120px', minWidth: '120px' }}
      >
        Next
      </button>
    </div>
  );
}

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('recent');
  const [recentTokenIds, setRecentTokenIds] = useState<number[] | null>(null);
  const [yourTokenIds, setYourTokenIds] = useState<number[] | null>(null);
  const [page, setPage] = useState(0); // 0 = newest, 1 = next 10, etc.
  const pageSize = 10;
  const account = useAccount();

  const fetchData = async () => {
    try {
      const recentTokens = await fetchRecentTokenIds();
      setRecentTokenIds(recentTokens);

      console.log('Fetching your tokens for address: ', account?.address);
      const address = account?.address as string;
      if (address) {
        const yourTokens = await fetchYourTokens(account?.address as string);
        setYourTokenIds(yourTokens);
      }

      setLoading(false);
    } catch (error) {
      console.error('Gallery error:', error);
      setLoading(false);
      handleError(error);
    }
  };

  useEffect(() => {
    console.log('Current account: ', account.address);
    fetchData();
  }, []);

  // Calculate paginated slice for recent
  const paginatedRecentTokenIds = recentTokenIds
    ? recentTokenIds.slice(page * pageSize, (page + 1) * pageSize)
    : [];
  const totalPages = recentTokenIds ? Math.ceil(recentTokenIds.length / pageSize) : 1;

  return (
    <>
      <h1>Gallery</h1>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Tabs
            variant="unstyled"
            defaultValue="settings"
            classNames={styles}
            value={activeTab}
            onChange={setActiveTab}
          >
            <Tabs.List grow>
              <Tabs.Tab
                value="recent"
                leftSection={<IconArtboard style={{ width: rem(16), height: rem(16) }} />}
              >
                Recent
              </Tabs.Tab>
              <Tabs.Tab
                value="yours"
                leftSection={<IconHeart style={{ width: rem(16), height: rem(16) }} />}
              >
                Yours
              </Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="recent" pt="xs">
              <PageNavigator page={page} totalPages={totalPages} setPage={setPage} />
              <SimpleGrid cols={1} spacing="lg">
                {paginatedRecentTokenIds.map((tokenId) => (
                  <Artwork key={tokenId} tokenId={tokenId} />
                ))}
              </SimpleGrid>
              <PageNavigator page={page} totalPages={totalPages} setPage={setPage} />
            </Tabs.Panel>
            <Tabs.Panel value="yours" pt="xs">
              {yourTokenIds != undefined && yourTokenIds?.length > 0 ? (
                <SimpleGrid cols={1} spacing="lg">
                  {yourTokenIds?.map((tokenId) => <Artwork key={tokenId} tokenId={tokenId} />)}
                </SimpleGrid>
              ) : (
                <Grid justify="center" align="center">
                  <center>
                    <Text style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                      You haven't minted any Anglez yet. <br /> Why not{' '}
                      <Link href={'create'}>get started?</Link>
                    </Text>
                  </center>
                </Grid>
              )}
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </>
  );
}
