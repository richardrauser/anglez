/**
 * Farcaster Frames v1 ("vNext") helpers.
 *
 * These used to come from `@coinbase/onchainkit/frame`, which dropped the entire
 * `/frame` export in its 1.x line - Frames v1 is superseded by Mini Apps (see
 * `src/farcaster/miniapp.ts`). The handful of helpers the app used live here instead, so
 * the v1 routes under /api survive the removal of that dependency. The metadata and HTML
 * shapes deliberately match what OnchainKit 0.23.4 emitted.
 *
 * IMPORTANT: v1 validation is currently non-functional, and not because of this code.
 * Neynar has removed the endpoint it depends on - POST
 * https://api.neynar.com/v2/farcaster/frame/validate now answers
 * `{"code":"NotFound","message":"Route POST /v2/farcaster/frame/validate not found"}`
 * even with a valid API key. `getFrameMessage` therefore always fails closed, and the
 * three v1 routes always answer 500. Restoring them means verifying message bytes
 * against a Farcaster hub directly (e.g. via @farcaster/core) rather than through
 * Neynar; otherwise these routes and this module can simply be deleted.
 */

/** The untrusted, caller-supplied half of a frame POST body. */
export interface FrameData {
  buttonIndex: number;
  castId: { fid: number; hash: string };
  inputText: string;
  fid: number;
  messageHash: string;
  network: number;
  state: string;
  timestamp: number;
  transactionId?: string;
  url: string;
}

/** The JSON body a Farcaster client POSTs to a frame endpoint. */
export interface FrameRequest {
  untrustedData: FrameData;
  trustedData: { messageBytes: string };
}

/** The subset of Neynar's validation response the app reads. */
export interface FrameValidationData {
  address: string | null;
  button: number | undefined;
  following: boolean | undefined;
  input: string | undefined;
  interactor: {
    fid: number | undefined;
    custody_address: string | undefined;
    verified_accounts: string[] | undefined;
    verified_addresses: {
      eth_addresses: string[] | null | undefined;
      sol_addresses: string[] | null | undefined;
    };
  };
  liked: boolean | undefined;
  recasted: boolean | undefined;
  state: { serialized: string };
  transaction: { hash: string } | null;
  valid: boolean;
  raw: unknown;
}

export type FrameMessageResult =
  { isValid: true; message: FrameValidationData } | { isValid: false; message: undefined };

export type FrameButtonMetadata = {
  label: string;
  action?: 'post' | 'post_redirect' | 'link' | 'mint' | 'tx';
  target?: string;
  postUrl?: string;
};

export type FrameImageMetadata = {
  src: string;
  aspectRatio?: '1.91:1' | '1:1';
};

export type FrameMetadataOptions = {
  buttons?: FrameButtonMetadata[];
  image: FrameImageMetadata | string;
  input?: { text: string };
  postUrl?: string;
  refreshPeriod?: number;
  state?: unknown;
  ogTitle?: string;
  ogDescription?: string;
};

type ChainNamespace = 'eip155';
type ChainReference = string | number;

export type FrameTransactionResponse = {
  chainId: `${ChainNamespace}:${ChainReference}`;
  method: 'eth_sendTransaction' | 'eth_personalSign';
  params: {
    abi: unknown[];
    data?: `0x${string}`;
    to: `0x${string}`;
    value: string;
  };
};

/**
 * Build the `fc:frame:*` metadata map for a frame, for use as Next `metadata.other`.
 */
export function getFrameMetadata({
  buttons,
  image,
  input,
  postUrl,
  refreshPeriod,
  state,
}: FrameMetadataOptions): Record<string, string> {
  const metadata: Record<string, string> = { 'fc:frame': 'vNext' };

  const imageSrc = typeof image === 'string' ? image : image.src;
  if (typeof image !== 'string' && image.aspectRatio) {
    metadata['fc:frame:image:aspect_ratio'] = image.aspectRatio;
  }
  metadata['fc:frame:image'] = imageSrc;

  if (input) {
    metadata['fc:frame:input:text'] = input.text;
  }

  buttons?.forEach((button, index) => {
    const n = index + 1;
    metadata[`fc:frame:button:${n}`] = button.label;
    if (button.action) {
      metadata[`fc:frame:button:${n}:action`] = button.action;
    }
    if (button.target) {
      metadata[`fc:frame:button:${n}:target`] = button.target;
    }
    if (button.action === 'tx' && button.postUrl) {
      metadata[`fc:frame:button:${n}:post_url`] = button.postUrl;
    }
  });

  if (postUrl) {
    metadata['fc:frame:post_url'] = postUrl;
  }
  if (refreshPeriod) {
    metadata['fc:frame:refresh_period'] = refreshPeriod.toString();
  }
  if (state) {
    metadata['fc:frame:state'] = encodeURIComponent(JSON.stringify(state));
  }

  return metadata;
}

/**
 * Escape a value for safe interpolation into an HTML attribute. OnchainKit interpolated
 * these raw; anything reaching here is ours rather than user input, but frame state can
 * carry request-derived values, so quoting is cheap insurance against breaking the tag.
 */
function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Render a complete HTML document carrying a frame's metadata - what a frame POST
 * handler returns so the Farcaster client can render the next frame.
 */
export function getFrameHtmlResponse(options: FrameMetadataOptions): string {
  const metadata = getFrameMetadata(options);
  const imageSrc = typeof options.image === 'string' ? options.image : options.image.src;

  const tags = Object.entries(metadata)
    .map(
      ([property, content]) =>
        `  <meta property="${property}" content="${escapeAttribute(content)}" />`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta property="og:description" content="${escapeAttribute(options.ogDescription ?? 'Frame description')}" />
  <meta property="og:title" content="${escapeAttribute(options.ogTitle ?? 'Frame title')}" />
  <meta property="og:image" content="${escapeAttribute(imageSrc)}" />
${tags}
</head>
</html>`;
}

const NEYNAR_VALIDATE_URL = 'https://api.neynar.com/v2/farcaster/frame/validate';

/**
 * Validate a frame POST body with Neynar and return the decoded message.
 *
 * Returns `isValid: false` for anything we can't positively verify - a missing key, a
 * non-200 from Neynar, or a response Neynar itself marks invalid. Callers must reject
 * the request in that case rather than trusting `untrustedData`.
 */
export async function getFrameMessage(
  body: FrameRequest,
  options?: { neynarApiKey?: string }
): Promise<FrameMessageResult> {
  const apiKey = options?.neynarApiKey;
  if (!apiKey) {
    console.error('Frame validation skipped: no Neynar API key configured.');
    return { isValid: false, message: undefined };
  }

  const messageBytes = body?.trustedData?.messageBytes;
  if (!messageBytes) {
    return { isValid: false, message: undefined };
  }

  let payload: any;
  try {
    const response = await fetch(NEYNAR_VALIDATE_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        api_key: apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        message_bytes_in_hex: messageBytes,
        cast_reaction_context: true,
        follow_context: true,
      }),
    });

    if (!response.ok) {
      console.error(`Frame validation failed: Neynar returned ${response.status}`);
      return { isValid: false, message: undefined };
    }

    payload = await response.json();
  } catch (error) {
    console.error('Frame validation failed: could not reach Neynar.', error);
    return { isValid: false, message: undefined };
  }

  if (!payload?.valid) {
    return { isValid: false, message: undefined };
  }

  const { action } = payload;
  const interactor = action?.interactor;

  return {
    isValid: true,
    message: {
      address: action?.address ?? null,
      button: action?.tapped_button?.index,
      following: interactor?.viewer_context?.following,
      input: action?.input?.text,
      interactor: {
        fid: interactor?.fid,
        custody_address: interactor?.custody_address,
        verified_accounts: interactor?.verifications,
        verified_addresses: {
          eth_addresses: interactor?.verified_addresses?.eth_addresses,
          sol_addresses: interactor?.verified_addresses?.sol_addresses,
        },
      },
      liked: action?.cast?.viewer_context?.liked,
      recasted: action?.cast?.viewer_context?.recasted,
      state: { serialized: action?.state?.serialized || '' },
      transaction: action?.transaction ?? null,
      valid: payload.valid,
      raw: payload,
    },
  };
}
