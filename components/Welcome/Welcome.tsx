import { Title, Text, Anchor } from '@mantine/core';
import classes from './Welcome.module.css';

export function Welcome() {
  return (
    <>
      <Title className={classes.title} ta="center" mt={100}>
        Welcome to{' '}
        <Text inherit variant="gradient" component="span" gradient={{ from: 'blue', to: 'orange' }}>
          anglez.xyz
        </Text>
      </Title>
      <Text c="dimmed" ta="center" size="lg" maw={580} mx="auto" mt="xl">
        Create abstract, on-chain NFT art.<br></br>
        <Anchor href="create" size="lg">
          Get started creating anglez!
        </Anchor>
      </Text>
    </>
  );
}
