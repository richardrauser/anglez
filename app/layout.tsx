import '@mantine/core/styles.css';
import 'styles/global.css';

import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from '../theme';
import { PlanesNavBar } from '@/components/PlanesNavBar/PlanesNavBar';
// import { PlanesAppShell } from '../components/PlanesAppShell/PlanesAppShell';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: 'Planes generative NFT art',
  description: 'Planes on-chain, generative NFT art by volstrate.',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee+Hairline&family=Tektur:wght@400..900&display=swap"
          rel="stylesheet"
        />{' '}
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
          <ToastContainer />
          <div className="mainContent">{children}</div>
        </MantineProvider>
      </body>
    </html>
  );
}
