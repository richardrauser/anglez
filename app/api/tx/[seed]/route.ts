import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { Address, encodeFunctionData, parseEther } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import abi from '@/contract/Anglez.json';
import type { FrameTransactionResponse } from '@coinbase/onchainkit/frame';
import { AnglezContractAddress } from '@/src/Constants';

async function getResponse(
  req: NextRequest,
  { params }: { params: { seed: number } }
): Promise<NextResponse | Response> {
  const randomSeed = params.seed;
  const body: FrameRequest = await req.json();
  // Remember to replace 'NEYNAR_ONCHAIN_KIT' with your own Neynar API key
  const { isValid, message } = await getFrameMessage(body, {
    neynarApiKey: process.env.NEYNAR_API_KEY,
  });

  if (!isValid) {
    return new NextResponse('Message not valid', { status: 500 });
  }

  // var state;

  // try {
  //   state = JSON.parse(decodeURIComponent(message.state?.serialized));
  // } catch (e) {
  //   console.error(e);
  // }

  // const randomSeed = state.seed;
  console.log('Farcaster mint route - random seed: ' + randomSeed);
  const data = encodeFunctionData({
    abi: abi.abi,
    functionName: 'mintRandom',
    args: [randomSeed],
  });

  const txData: FrameTransactionResponse = {
    chainId: `eip155:${base.id}`,
    method: 'eth_sendTransaction',
    params: {
      abi: [],
      data,
      to: AnglezContractAddress as Address,
      value: parseEther('0.001').toString(), // 0 ETH
    },
  };
  return NextResponse.json(txData);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { seed: number } }
): Promise<Response> {
  return getResponse(req, { params });
}

export const dynamic = 'force-dynamic';
