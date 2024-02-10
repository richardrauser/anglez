import '@mantine/core/styles.css';
import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from '../theme';
import { PlanesNavBar } from '@/components/PlanesNavBar/PlanesNavBar';
// import { PlanesAppShell } from '../components/PlanesAppShell/PlanesAppShell';

export const metadata = {
  title: 'Mantine Next.js template',
  description: 'I am using Mantine with Next.js!',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {/* <PlanesAppShell>{children}</PlanesAppShell> */}
          <PlanesNavBar />
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
