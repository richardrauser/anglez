import { canOpenWalletPopup } from './canOpenWalletPopup';

describe('canOpenWalletPopup', () => {
  afterEach(() => {
    delete (window as any).ReactNativeWebView;
  });

  it('allows a popup in an ordinary browser', () => {
    expect(canOpenWalletPopup()).toBe(true);
  });

  it('refuses one inside a native app WebView', () => {
    // What Farcaster's in-app browser injects. A popup opened from here becomes a plain
    // tab of the host's browser, with no opener for the wallet to answer through.
    (window as any).ReactNativeWebView = { postMessage: () => {} };

    expect(canOpenWalletPopup()).toBe(false);
  });
});
