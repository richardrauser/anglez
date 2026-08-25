import type { Config } from 'wagmi';
import { getConnection, watchConnection } from 'wagmi/actions';

type Connection = ReturnType<typeof getConnection>;

const SETTLING = new Set(['connecting', 'reconnecting']);

/**
 * Resolve once wagmi has finished deciding whether a wallet is connected.
 *
 * On a fresh page load wagmi reports `reconnecting` while it looks for a stored session,
 * whether or not one exists. Answering a click during that window is guesswork: telling
 * the user "still connecting, try again in a moment" is wrong when there was never a
 * session to restore, and by the time they read it the button already says "Connect
 * Wallet". Waiting for the state to settle lets the caller give one correct answer
 * instead - mint, or ask them to connect.
 *
 * Falls back to whatever the current state is if it has not settled within `timeoutMs`,
 * so a connector that never resolves cannot hang the button forever.
 */
export function waitForWalletToSettle(config: Config, timeoutMs = 4000): Promise<Connection> {
  const current = getConnection(config);
  if (!SETTLING.has(current.status)) {
    return Promise.resolve(current);
  }

  return new Promise((resolve) => {
    // Held on an object so `finish` can reference it before the timer and watcher below
    // exist - watchConnection may settle synchronously as it is being set up.
    const state = { settled: false, cleanup: () => {} };

    const finish = (connection: Connection) => {
      if (state.settled) {
        return;
      }
      state.settled = true;
      state.cleanup();
      resolve(connection);
    };

    const timer = setTimeout(() => finish(getConnection(config)), timeoutMs);
    const unwatch = watchConnection(config, {
      onChange(connection) {
        if (!SETTLING.has(connection.status)) {
          finish(connection);
        }
      },
    });

    state.cleanup = () => {
      clearTimeout(timer);
      unwatch();
    };

    if (state.settled) {
      state.cleanup();
    }
  });
}
