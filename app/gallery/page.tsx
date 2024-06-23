'use client';
import { useEffect, useState } from 'react';
import { fetchRecentTokenIds } from '@/src/BlockchainServerAPI';
import Loading from '@/components/Loading/Loading';
import Artwork from '@/components/Artwork/Artwork';
import { Container, Grid, SimpleGrid, Tabs, rem } from '@mantine/core';
import { handleError } from '@/src/ErrorHandler';
import { IconArtboard, IconHeart } from '@tabler/icons-react';
import styles from './GalleryPage.module.css';
import { ContractEventPayload } from 'ethers';
import { fetchYourTokens } from '@/src/BlockchainAPI';
import Link from 'next/link';

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>('recent');
  const [recentTokenIds, setRecentTokenIds] = useState<number[] | null>(null);
  const [yourTokenIds, setYourTokenIds] = useState<number[] | null>(null);

  const fetchData = async () => {
    try {
      const recentTokens = await fetchRecentTokenIds();
      setRecentTokenIds(recentTokens);

      const yourTokens = await fetchYourTokens();
      setYourTokenIds(yourTokens);

      setLoading(false);
    } catch (error) {
      console.error('Gallery error:', error);
      setLoading(false);
      handleError(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
              <SimpleGrid cols={1} spacing="lg">
                {recentTokenIds?.map((tokenId) => <Artwork tokenId={tokenId} />)}
              </SimpleGrid>
            </Tabs.Panel>
            <Tabs.Panel value="yours" pt="xs">
              {yourTokenIds != undefined && yourTokenIds?.length > 0 ? (
                <SimpleGrid cols={1} spacing="lg">
                  {yourTokenIds?.map((tokenId) => <Artwork tokenId={tokenId} />)}
                </SimpleGrid>
              ) : (
                <Grid justify="center" align="center">
                  <p>
                    <center>
                      You haven't minted any Anglez yet. <br /> Why not{' '}
                      <Link href={'create'}>get started?</Link>
                    </center>
                  </p>
                </Grid>
              )}
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </>
  );
}
