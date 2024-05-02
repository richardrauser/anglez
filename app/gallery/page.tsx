'use client';
import { useEffect, useState } from 'react';
import { fetchRecentTokenIds } from '@/src/BlockchainAPI';
import Loading from '@/components/Loading/Loading';
import Artwork from '@/components/Artwork/Artwork';
import { Container, Grid, SimpleGrid } from '@mantine/core';
import { handleError } from '@/src/ErrorHandler';

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [tokenIds, setTokenIds] = useState<number[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokens = await fetchRecentTokenIds();
        console.log('Got tokens: ', tokens);
        setTokenIds(tokens);
        setLoading(false);
      } catch (error) {
        console.error('Gallery error:', error);
        setLoading(false);
        handleError(error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h1>Gallery</h1>
      {loading ? (
        <Loading />
      ) : (
        <SimpleGrid cols={1} spacing="lg">
          {tokenIds?.map((tokenId) => <Artwork tokenId={tokenId} />)}
        </SimpleGrid>
      )}
    </>
  );
}
