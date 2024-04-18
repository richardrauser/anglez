'use client';
import { fetchTokenDetails } from '@/src/BlockchainAPI';
import { useEffect, useState } from 'react';

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const [svg, setSvg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data for token ID:', params.id);
      const tokenDetails = await fetchTokenDetails(params.id);
      console.log(tokenDetails);
      setSvg(tokenDetails?.svg);
    };
    fetchData();
  }, []);

  return (
    <>
      Artwork
      <p>ID: {params.id}</p>
      {svg && <img src={`data:image/svg+xml,${encodeURIComponent(svg)}`} />}
    </>
  );
}
