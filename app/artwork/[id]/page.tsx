'use client';
import { fetchTokenDetails } from '@/src/BlockchainAPI';
import { useEffect, useState } from 'react';

export default function ArtworkPage({ params }: { params: { id: string } }) {
  const [svg, setSvg] = useState(null);
  const [seed, setSeed] = useState(null);
  const [shapeCount, setShapeCount] = useState(null);
  const [zoom, setZoom] = useState(null);
  const [cyclic, setCyclic] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data for token ID: ', params.id);
      const tokenDetails = await fetchTokenDetails(params.id);
      console.log(tokenDetails);
      setSvg(tokenDetails?.svg);
      setSeed(tokenDetails?.seed);
      setShapeCount(tokenDetails?.shapeCount);
      setZoom(tokenDetails?.zoom);
      setCyclic(tokenDetails?.cyclic);
    };
    fetchData();
  }, []);

  return (
    <>
      Artwork
      <div className="panel">
        <p>Planez #{params.id}</p>
        <div className="artboard">
          <img
            className="artboardImage"
            src={`data:image/svg+xml,${encodeURIComponent(svg)}`}
          ></img>
          <p>Random seed: {seed}</p>
          <p>Shape count: {shapeCount}</p>
          <p>Zoom: {zoom}</p>
          <p>cyclic: {cyclic}</p>
        </div>
      </div>
    </>
  );
}
