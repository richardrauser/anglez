import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '@/src/Constants';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const body: FrameRequest = await req.json();
  const { isValid } = await getFrameMessage(body);

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        // {
        //   label: `Tx: ${body?.untrustedData?.transactionId || '--'}`,
        // },
        {
          label: 'All done! Mint another?',
        },
      ],
      image: {
        src: `${NEXT_PUBLIC_URL}/anglez-square.png`,
        aspectRatio: '1:1',
      },
      postUrl: `https://www.anglez.xyz/api/frame`,
    })
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
