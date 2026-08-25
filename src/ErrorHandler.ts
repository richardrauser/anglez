import { showErrorMessage } from './UIUtils';
import * as Errors from './ErrorMessages';
import { AnglezCurrentNetworkName } from './Constants';
import { switchToCurrentNetwork } from './BlockchainAPI';

// viem's "unknown error" sentinel. It means "no useful code here", so a wrapper
// carrying it should not stop the search for the real one further down the chain.
const UNKNOWN_ERROR_CODE = -1;

/**
 * Collect a property from anywhere in an error's `cause` chain.
 *
 * viem/wagmi errors arrive wrapped several layers deep - a rejected mint is a
 * ContractFunctionExecutionError wrapping a TransactionExecutionError wrapping the
 * UserRejectedRequestError - and only the innermost layer carries the provider code
 * (4001). Looking just one level down finds `undefined` and every code test below
 * then falls through to the generic "An error occurred." message. ethers nests its
 * own errors similarly, so walk the whole chain rather than guessing a depth.
 */
function findInCauseChain(error: any, key: 'code' | 'reason'): any {
  const seen = new Set<any>();
  let sentinel: any;
  let current = error;

  while (current != null && typeof current === 'object' && !seen.has(current)) {
    seen.add(current);
    const value = current[key];
    if (value != null) {
      if (value !== UNKNOWN_ERROR_CODE) {
        return value;
      }
      // Remember it, but keep looking for something more specific.
      sentinel = value;
    }
    current = current.cause;
  }

  return sentinel;
}

/**
 * The provider error code from anywhere in an error's `cause` chain, or undefined.
 */
export function findErrorCode(error: any): any {
  return findInCauseChain(error, 'code');
}

export function handleError(error: any) {
  console.log(`Handling error ${error.name}: ${error.message}`);

  const reason = findInCauseChain(error, 'reason');
  const code = findInCauseChain(error, 'code');

  console.log('Error reason: ', reason);
  console.log('Error code: ', code);

  if (code === 4100) {
    showErrorMessage('Your wallet session has expired. Please try connecting again.');
  } else if (code === 4001) {
    showErrorMessage('You rejected the request. 😢');
  } else if (code === 'INSUFFICIENT_FUNDS') {
    showErrorMessage(
      'Insufficient funds to pay for this transation. Please add more funds to your crypto wallet.'
    );
  } else if (code === -32002) {
    // -32002: already requesting accounts
    showErrorMessage('Already requesting accounts. Please open your crypto wallet to confirm.');
  } else if (code === -32603) {
    // Internal JSON RPC error
    if (error.data != null && error.data.message != null) {
      showErrorMessage(`Oops, an error ocurred. ${error.data.message}`);
    } else if (error.details != null) {
      const errorMessage = `Oops, an error occurred: ${error.details}`;
      showErrorMessage(errorMessage);
    } else {
      showErrorMessage('Oops, an Internal JSON RPC error occurred. ');
    }
  } else if (code === 'ACTION_REJECTED') {
    showErrorMessage('You rejected the request. 😢');
  } else if (error.message === Errors.NGLZ_NO_ETH_WALLET) {
    showErrorMessage('No crypto wallet detected. Please install MetaMask or Coinbase Wallet.');
  } else if (code === 'UNSUPPORTED_OPERATION' && error.message.startsWith('unknown account')) {
    showErrorMessage('You need to connect an Ethereum wallet like MetaMask or Coinbase Wallet.');
  } else if (error.message === Errors.NGLZ_NO_ETH_ACCOUNT) {
    showErrorMessage(
      'You need to connect an account via your crypto wallet before you can do that.'
    );
  } else if (error.message === Errors.NGLZ_WRONG_ETH_NETWORK) {
    const errorMessage = `You're on the wrong network. Tap here to switch to ${AnglezCurrentNetworkName}.`;
    const onClose = switchToCurrentNetwork;
    showErrorMessage(errorMessage, onClose);
    // showErrorMessage(errorMessage);
  } else if (error.message === Errors.NGLZ_SEED_USED) {
    showErrorMessage('This random seed has already been used! Randomize or refresh and try again.');
  } else if (reason === 'SEED_USED') {
    showErrorMessage('This random seed has already been used! Randomize or refresh and try again.');
  } else if (code != null) {
    showErrorMessage(`An error occurred: ${code}.`);
  } else {
    showErrorMessage('An error occurred.');
  }
}
