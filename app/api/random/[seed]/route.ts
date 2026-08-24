import sharp from 'sharp';
import { buildArtwork, generateRandomTokenParams } from '@/src/anglez';
// const sharp = require('sharp');

export async function GET(_request: Request, { params }: { params: Promise<{ seed: string }> }) {
  const { seed } = await params;

  // console.log('SEED:', seed);

  const tokenParams = generateRandomTokenParams(parseInt(seed, 10));
  const anglezSvg = buildArtwork(tokenParams);

  console.log('ANGLEZ:', anglezSvg);

  const anglezPng = await sharp(Buffer.from(anglezSvg), { density: 300 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  // .toFile('out.png');

  // Response.sendFile(anglezSvg, 'anglez.svg', { headers: { 'Content-Type': 'image/svg+xml' } });
  // return Response.json({ seed: anglezPng });

  // return new Response(anglezSvg, {
  //   status: 200,
  //   headers: {
  //     'Content-Type': 'image/svg+xml',
  //   },
  // });
  return new Response(new Uint8Array(anglezPng), {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
    },
  });
}
