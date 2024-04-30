'use client';
import { useEffect, useState } from 'react';
import { fetchRecentTokenIds } from '@/src/BlockchainAPI';
import Loading from '@/components/Loading/Loading';
import Artwork from '@/components/Artwork/Artwork';
import { Container, Grid, SimpleGrid } from '@mantine/core';

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [tokenIds, setTokenIds] = useState<number[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const tokens = await fetchRecentTokenIds();
      setTokenIds(tokens);
      setLoading(false);
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
          {tokenIds?.map((tokenId) => <Artwork key={tokenId} tokenId={tokenId} />)}
        </SimpleGrid>
      )}
    </>
  );
}
