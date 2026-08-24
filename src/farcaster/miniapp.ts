/**
 * Farcaster Mini App embed metadata.
 *
 * Mini Apps replace Frames v1: instead of a chain of server-rendered frames driven by
 * POSTs, a cast carries a single embed that launches the real web app in Farcaster's
 * webview. The mint then happens through the app's own UI over wagmi, using the Mini App
 * connector wired up in `app/config.ts`.
 *
 * Frames v1 has been removed entirely: Neynar dropped the endpoint its message
 * validation depended on, so those routes could no longer verify anything and always
 * failed closed. Note that both standards use the `fc:frame` meta tag - here it carries
 * the same JSON as `fc:miniapp` for backwards compatibility, rather than the v1 `"vNext"`
 * marker it held before.
 */

import { NEXT_PUBLIC_URL } from '@/src/Constants';

export type MiniAppEmbed = {
  version: '1';
  imageUrl: string;
  button: {
    title: string;
    action: {
      type: 'launch_miniapp' | 'launch_frame';
      url: string;
      name?: string;
      splashImageUrl?: string;
      splashBackgroundColor?: string;
    };
  };
};

export const MINIAPP_NAME = 'anglez';
/** 200x200, the size the Mini App spec expects for a splash image. */
export const MINIAPP_SPLASH_IMAGE = `${NEXT_PUBLIC_URL}/anglez-splash-200.png`;
export const MINIAPP_SPLASH_BACKGROUND = '#ffffff';

/** 3:2, 1200x800 - the aspect ratio and minimum size the embed spec requires. */
export const MINIAPP_EMBED_IMAGE = `${NEXT_PUBLIC_URL}/anglez-miniapp-embed.png`;

function buildEmbed(
  type: 'launch_miniapp' | 'launch_frame',
  { title, url, imageUrl }: { title: string; url: string; imageUrl: string }
): MiniAppEmbed {
  return {
    version: '1',
    imageUrl,
    button: {
      title,
      action: {
        type,
        url,
        name: MINIAPP_NAME,
        splashImageUrl: MINIAPP_SPLASH_IMAGE,
        splashBackgroundColor: MINIAPP_SPLASH_BACKGROUND,
      },
    },
  };
}

/**
 * Build the pair of meta tags that advertise a page as a Mini App, ready to spread into
 * a Next `metadata.other` object.
 *
 * Both tags carry the same embed; only `action.type` differs, so older clients that only
 * understand `launch_frame` still resolve to the same destination.
 */
export function getMiniAppMetadata({
  title = 'generate anglez',
  url = NEXT_PUBLIC_URL,
  imageUrl = MINIAPP_EMBED_IMAGE,
}: { title?: string; url?: string; imageUrl?: string } = {}): Record<string, string> {
  return {
    'fc:miniapp': JSON.stringify(buildEmbed('launch_miniapp', { title, url, imageUrl })),
    'fc:frame': JSON.stringify(buildEmbed('launch_frame', { title, url, imageUrl })),
  };
}
