import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '@/src/Constants';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  console.log('In Frame API route. Yay.');

  const body: FrameRequest = await req.json();

  console.log('NEYNAR: ' + process.env.NEYNAR_API_KEY);
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_API_KEY,
  });

  console.log('Message: ' + JSON.stringify(message));
  if (!isValid) {
    return new NextResponse('Oh dear! Message not valid', { status: 500 });
  }

  // const text = message.input || '';
  // let state = {
  //   page: 0,
  // };
  // try {
  //   state = JSON.parse(decodeURIComponent(message.state?.serialized));
  // } catch (e) {
  //   console.error(e);
  // }

  // customize button
  // if (message?.button === 2) {
  //   return NextResponse.redirect('https://anglez.xyz/create', { status: 302 });
  // }

  const randomSeed = Math.trunc(Math.random() * 5_000_000);

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `generate anglez`,
        },
        {
          action: 'tx',
          label: 'mint #' + randomSeed,
          target: `${NEXT_PUBLIC_URL}/api/tx/${randomSeed}`,
          postUrl: `${NEXT_PUBLIC_URL}/api/tx-success`,
        },
        {
          action: 'link',
          label: 'customize!',
          target: 'https://anglez.xyz/create?tab=custom&seed=' + randomSeed,
        },
        // {
        //   action: 'post_redirect',
        //   label: 'Dog pictures',
        // },
      ],
      image: {
        src: `${NEXT_PUBLIC_URL}/api/random/${randomSeed}`,
        aspectRatio: '1:1',
      },
      postUrl: `https://www.anglez.xyz/api/frame`,
      state: {
        seed: randomSeed,
        time: new Date().toISOString(),
      },
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
