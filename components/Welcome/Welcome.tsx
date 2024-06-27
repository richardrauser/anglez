'use client';
import { Title, Text, Anchor, Button } from '@mantine/core';
import classes from './Welcome.module.css';
import Image from 'next/image';
import { IconArrowRight } from '@tabler/icons-react';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt="lg" mb="lg">
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'blue', to: 'orange' }}>
          anglez.xyz
        </Text>
      </Title>
      <center>
        <Image src="/anglez-animated-1.gif" alt="anglez" width={300} height={300} />
        <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="lg">
          Create abstract, on-chain NFT art.<br></br>
        </Text>
        <Button mt="lg" component="a" href="/create" rightSection={<IconArrowRight size={14} />}>
          Get started creating anglez!
        </Button>
      </center>
    </>
  );
}
