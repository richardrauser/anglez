import '@mantine/core/styles.css';
import '../styles/global.css';

import React from 'react';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import { theme } from '../theme';
import { AnglezNavBar } from '@/components/NavBar/NavBar';
// import { AnglezAppShell } from '../components/AnglezAppShell/AnglezAppShell';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { Providers } from './Providers';
import { NEXT_PUBLIC_URL } from '@/src/Constants';
import { getFrameMetadata } from '@coinbase/onchainkit/frame';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'randomize',
    },
    {
      label: 'customize',
    },
    {
      action: 'tx',
      label: 'mint!',
      target: `${NEXT_PUBLIC_URL}/api/tx`,
      postUrl: `${NEXT_PUBLIC_URL}/api/tx-success`,
    },
  ],
  image: {
    src: `${NEXT_PUBLIC_URL}/anglez-square.png`,
    aspectRatio: '1:1',
  },
  // input: {
  //   text: 'Tell me a story',
  // },
  postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata = {
  title: 'anglez generative NFT art',
  description: 'anglez - abract, anguluar, on-chain, generative NFT art by volstrate.',
  'twitter:card': 'anglez - abstract, angular, on-chain art',
  'twitter:site': '@volstrate',
  'twitter:title': 'anglez - abstract, angular, on-chain art',
  'twitter:description': 'anglez - abract, anguluar, on-chain, generative NFT art by volstrate.',
  'twitter:creator': '@volstrate',
  'twitter:image': `${NEXT_PUBLIC_URL}/anglez-square.png`,
  'og:image': `${NEXT_PUBLIC_URL}/anglez-square.png`,
  openGraph: {
    title: 'anglez - abstract, angular, on-chain art',
    url: 'https://anglez.xyz/',
    description: 'anglez - abract, anguluar, on-chain, generative NFT art by volstrate.  ',
    images: [{ url: `https://www/amgle/anglez-square.png` }],
    // images: [`${NEXT_PUBLIC_URL}/park-1.png`],
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
        />{' '}
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Providers>
            {/* <AnglezAppShell>{children}</AnglezAppShell> */}
            <AnglezNavBar />
            <ToastContainer position="top-left" />
            <div className="mainContent">{children}</div>
          </Providers>
        </MantineProvider>
      </body>
    </html>
  );
}
