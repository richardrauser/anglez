'use client';
import { useState } from 'react';
import { Container, Group, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
// import { MantineLogo } from '@mantinex/mantine-logo';
import classes from './NavBar.module.css';
import ConnectButton from '../ConnectButton/ConnectButton';

const links = [
  { link: '/', label: 'anglez.xyz v0.1' },
  { link: '/create', label: 'create' },
  { link: '/gallery', label: 'gallery' },
  { link: '/about', label: 'about' },
];

export function AnglezNavBar() {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      // data-active={active === link.link || undefined}
      onClick={(event) => {
        // event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  // TODO: Burger for mobile
  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        {/* <MantineLogo size={28} /> */}
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
        <ConnectButton />
      </Container>
    </header>
  );
}
