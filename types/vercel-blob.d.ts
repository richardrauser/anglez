declare module '@vercel/blob' {
  export interface HeadResult {
    url?: string;
  }
  export function head(key: string): Promise<HeadResult>;
  export function put(
    key: string,
    data: ArrayBufferView | ArrayBuffer | Blob | Buffer,
    options: {
      access?: 'public' | 'private';
      addRandomSuffix?: boolean;
      contentType?: string;
      cacheControlMaxAge?: number;
    }
  ): Promise<{ url: string }>;
}
