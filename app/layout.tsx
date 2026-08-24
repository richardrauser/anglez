import '@mantine/core/styles.css';
import '../styles/global.css';

import React from 'react';
import { MantineProvider } from '@mantine/core';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Analytics } from '@vercel/analytics/react';
import { AnglezNavBar } from '@/components/NavBar/NavBar';
// import { AnglezAppShell } from '../components/AnglezAppShell/AnglezAppShell';
import { getMiniAppMetadata } from '@/src/farcaster/miniapp';
import { MiniAppReady } from '@/components/MiniAppReady/MiniAppReady';
import { theme } from '../theme';
import { Providers } from './Providers';

// Advertises the site as a Farcaster Mini App. This replaces the old Frames v1 `vNext`
// metadata: the two standards share the `fc:frame` tag and cannot both occupy it, so new
// casts launch the Mini App while the v1 POST routes under /api stay live for clients
// still driving the older flow.
const frameMetadata = getMiniAppMetadata({ title: 'generate anglez' });

export const metadata = {
  title: 'anglez generative NFT art',
  description: 'anglez - abract, angular, on-chain, generative NFT art by volstrate.',
  'twitter:card': 'summary',
  'twitter:site': '@volstrate',
  'twitter:title': 'anglez - abstract, angular, on-chain art',
  'twitter:description': 'anglez - abract, angular, on-chain, generative NFT art by volstrate.',
  'twitter:creator': '@volstrate',
  'og:image': 'https://anglez.xyz/anglez-quadrants.png',
  openGraph: {
    title: 'anglez - abstract, angular, on-chain art',
    url: 'https://anglez.xyz/',
    description: 'anglez - abract, angular, on-chain, generative NFT art by volstrate.  ',
    images: [{ url: 'https://anglez.xyz/anglez-quadrants.png' }],
  },
  other: {
    ...frameMetadata,
  },
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bungee+Hairline&family=Tektur:wght@400..900&display=swap"
          rel="stylesheet"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} forceColorScheme="light">
          <Providers>
            {/* <AnglezAppShell>{children}</AnglezAppShell> */}
            <MiniAppReady />
            <AnglezNavBar />
            <ToastContainer position="top-left" />
            <div className="mainContent">{children}</div>
          </Providers>
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}
