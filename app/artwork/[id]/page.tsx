'use client';
import Loading from '@/components/Loading/Loading';
import { TokenDetails } from '@/src/TokenDetails';
import { fetchTokenDetails } from '@/src/BlockchainServerAPI';
import { Button, Text } from '@mantine/core';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import ethereumIcon from '@/images/ethereum-white.png';
import {
  AnglezContractAddress,
  AnglezCurrentNetworkExplorerUrl,
  AnglezCurrentNetworkName,
} from '@/src/Constants';

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

  const handleViewOnOpenSea = async () => {
    const url = `https://testnets.opensea.io/assets/${AnglezCurrentNetworkName.toLocaleLowerCase()}/${AnglezContractAddress}?a=${
      params.id
    }`;
    window.open(url, '_blank');
  };

  const handleViewOnBlockExplorer = async () => {
    const url = `${AnglezCurrentNetworkExplorerUrl}/token/${AnglezContractAddress}?a=${params.id}`;
    window.open(url, '_blank');
  };

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
                <b>Custom:</b> {tokenDetails?.attributes.isCustom}
              </div>
              <div>
                <b>Shapes:</b> {tokenDetails?.attributes.shapeCount}
              </div>
              <div>
                <b>Style:</b> {tokenDetails?.attributes.style}
              </div>
              <div>
                <b>Structure:</b> {tokenDetails?.attributes.structure}
              </div>
              <div>
                <b>Tint color:</b> {tokenDetails?.attributes.tintColor}{' '}
              </div>
              <div>
                <b>Tint opacity:</b> {tokenDetails?.attributes.tintOpacity}{' '}
              </div>
              <div>
                <b>Owner:</b> <i>coming soon...</i>{' '}
              </div>
            </Text>
            <Button onClick={handleViewOnOpenSea} color="blue" size="lg">
              View on OpenSea
            </Button>
            <Button onClick={handleViewOnBlockExplorer} color="blue" size="lg">
              View on Block Explorer
            </Button>
          </div>
        </>
      )}
    </>
  );
}
