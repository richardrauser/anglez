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
import { shortenAddress } from '@/src/BlockchainAPI';
import Link from 'next/link';

export default function ArtworkPage({ params }: { params: { id: number } }) {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null);
  const [pngFileName, setPngFileName] = useState<string>('');
  const [svgFileName, setSvgFileName] = useState<string>('');

  const [pngData, setPngData] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data for token ID: ', params.id);
      const tokenDetails = await fetchTokenDetails(params.id);

      if (tokenDetails) {
        setPngFileName(`anglez-#${tokenDetails.tokenId}.png`);
        setSvgFileName(`anglez-#${tokenDetails.tokenId}.svg`);
      }

      console.log('Setting token details: ', tokenDetails);
      setTokenDetails(tokenDetails);
    };
    fetchData();
  }, []);

  const handleViewOnOpenSea = async () => {
    const url = `https://opensea.io/assets/base/${AnglezContractAddress}/${params.id}`;
    window.open(url, '_blank');
  };

  const handleViewOnBlockExplorer = async () => {
    const url = `${AnglezCurrentNetworkExplorerUrl}/token/${AnglezContractAddress}?a=${params.id}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <h1>Anglez #{params.id}</h1>
      {tokenDetails === null ? (
        <Loading />
      ) : (
        <>
          <div className="artboard">
            <img
              id="anglezImage"
              className="artboardImage"
              src={`data:image/svg+xml,${encodeURIComponent(tokenDetails.svg)}`}
              onLoad={() => {
                var canvas = document.createElement('canvas');
                canvas.width = 1000;
                canvas.height = 1000;
                var ctx = canvas.getContext('2d');
                if (!ctx) {
                  return;
                }

                var anglezImage = document.getElementById('anglezImage') as HTMLImageElement;
                ctx.drawImage(anglezImage, 0, 0);

                setPngData(canvas.toDataURL('image/png'));
              }}
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
                <b>Tint opacity:</b>{' '}
                {Math.round(Number(tokenDetails?.attributes.tintOpacity) * 100)}%
              </div>
              <div>
                <b>Owner:</b>{' '}
                <a href={AnglezCurrentNetworkExplorerUrl + 'address/' + tokenDetails.owner}>
                  {shortenAddress(tokenDetails.owner)}
                </a>
              </div>
            </Text>
            <Button onClick={handleViewOnOpenSea} color="blue" size="lg">
              View on OpenSea
            </Button>
            <Button onClick={handleViewOnBlockExplorer} color="blue" size="lg">
              View on Block Explorer
            </Button>
            <br />
            <a href={tokenDetails.svgDataUri} download={svgFileName}>
              <Button>⬇ SVG</Button>
            </a>
            <a href={pngData} download={pngFileName}>
              <Button>⬇ PNG</Button>
            </a>
          </div>
        </>
      )}
    </>
  );
}
