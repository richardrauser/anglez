'use client';
import Loading from '@/components/Loading/Loading';
import { TokenDetails, fetchTokenDetails } from '@/src/BlockchainAPI';
import { Button, Text } from '@mantine/core';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import ethereumIcon from '@/images/ethereum-white.png';

export default function ArtworkPage({ params }: { params: { id: number } }) {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data for token ID: ', params.id);
      const tokenDetails = await fetchTokenDetails(params.id);
      console.log(tokenDetails);
      setTokenDetails(tokenDetails);
    };
    fetchData();
  }, []);

  return (
    <>
      <h1>Anglezs #{params.id}</h1>
      {tokenDetails === null ? (
        <Loading />
      ) : (
        <>
          <div className="artboard">
            <img
              className="artboardImage"
              src={`data:image/svg+xml,${encodeURIComponent(tokenDetails.svg)}`}
            ></img>
          </div>
          <div className="panel">
            <Text ta="left" size="lg">
              <div>
                <b>Seed:</b> {tokenDetails?.attributes.seed}
              </div>
              <div>
                <b>Shapes:</b> {tokenDetails?.attributes.shapeCount}
              </div>
              <div>
                <b>Zoom:</b> {tokenDetails?.attributes.zoom}
              </div>
              <div>
                <b>Cyclic:</b> {tokenDetails?.attributes.isCyclic}
              </div>
              <div>
                <b>Tint color:</b> {tokenDetails?.attributes.tintColor}{' '}
              </div>
              <div>
                <b>Tint transparency:</b> {tokenDetails?.attributes.tintTransparency}{' '}
              </div>
            </Text>
            <Button color="blue" size="lg">
              View on OpenSea
            </Button>
            <Button color="blue" size="lg">
              View on Block Explorer
            </Button>
          </div>
        </>
      )}
    </>
  );
}
