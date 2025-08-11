import { Card, SimpleGrid, Text } from '@mantine/core';
import { useEffect } from 'react';
import fetchTokenDetails from '@/src/TokenDetailsFetcher';
import { useState } from 'react';
import Loading from '../Loading/Loading';
import Link from 'next/link';

export default function Artwork(props: { tokenId: number }) {
  const [loading, setLoading] = useState(true);
  const [tokenDetails, setTokenDetails] = useState<any | null>(null);

  const fetchData = async () => {
    const details = await fetchTokenDetails(props.tokenId);
    // console.log('Details: ' + JSON.stringify(details));
    setTokenDetails(details);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card key={props.tokenId} className="basic" withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Text ta="left" size="xl">
          <Link href={'artwork/' + props.tokenId}>{'Anglez #' + props.tokenId}</Link>
        </Text>
      </Card.Section>
      <div>
        {loading ? (
          <Loading />
        ) : (
          <Card.Section inheritPadding mt="lg">
            <SimpleGrid cols={2}>
              <Text ta="left" size="m">
                <b>Seed:</b> {tokenDetails?.attributes.seed} <br />
                <b>Custom:</b> {tokenDetails?.attributes.isCustom}
                <br />
                <b>Shapes:</b> {tokenDetails?.attributes.shapeCount}
                <br />
                <b>Style:</b> {tokenDetails?.attributes.style}
                <br />
                <b>Structure:</b> {tokenDetails?.attributes.structure}
                <br />
                <b>Tint color:</b> {tokenDetails?.attributes.tintColor}
                <br />
                <b>Tint opacity:</b> {Math.round(tokenDetails?.attributes.tintOpacity * 100)}%
                <br />
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
