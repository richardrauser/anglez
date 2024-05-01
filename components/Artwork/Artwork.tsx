import { Card, SimpleGrid, Text } from '@mantine/core';
import { useEffect } from 'react';
import { fetchTokenDetails } from '@/src/BlockchainAPI';
import { useState } from 'react';
import Loading from '../Loading/Loading';
import Link from 'next/link';
import styles from './Artwork.module.css';

export default function Artwork(props: { tokenId: number }) {
  const [loading, setLoading] = useState(true);
  const [tokenDetails, setTokenDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const details = await fetchTokenDetails(props.tokenId);
      console.log('Details: ' + JSON.stringify(details));
      setTokenDetails(details);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <Card className="basic" withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Text ta="left" size="xl">
          <Link href={'artwork/' + props.tokenId}>Anglez #{props.tokenId}</Link>
        </Text>
      </Card.Section>
      <div>
        {loading ? (
          <Loading />
        ) : (
          <Card.Section inheritPadding mt="lg">
            <SimpleGrid cols={2}>
              <Text ta="left" size="m">
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
              <Link href={'artwork/' + tokenDetails.tokenId}>
                <img className="artwork" src={tokenDetails.svgDataUri} alt="Artwork" />
              </Link>
            </SimpleGrid>
          </Card.Section>
        )}
      </div>
    </Card>
  );
}
