'use client';
import { useState } from 'react';
import { Container, Group, Burger, Transition, Paper } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './NavBar.module.css';
import ConnectButton from '../ConnectButton/ConnectButton';

const links = [
  { link: '/', label: 'anglez.xyz v0.9' },
  { link: '/create', label: 'create' },
  { link: '/gallery', label: 'gallery' },
  { link: '/about', label: 'about' },
  {
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSfo2pZQHuzXXJHYt4nuneb9ww8XtbqEvOKYM5vPJ8M_IPQ88w/viewform',
    label: 'feedback',
  },
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

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        {/* <MantineLogo size={28} /> */}

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm"></Burger>
        <Group gap={5} visibleFrom="xs">
          {items}
        </Group>
        <Transition transition="slide-down" duration={200} mounted={opened}>
          {(styles) => (
            <Paper className={classes.dropdown} withBorder style={styles}>
              {items}
            </Paper>
          )}
        </Transition>
        <ConnectButton />
      </Container>
    </header>
  );
}
