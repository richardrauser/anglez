import { showErrorMessage } from './UIUtils';
import * as Errors from './ErrorMessages';
import { AnglezCurrentNetworkName } from './Constants';
import { switchToCurrentNetwork } from './BlockchainAPI';

export function handleError(error: any) {
  console.log('Handling error ' + error.name + ': ' + error.message);

  const reason = error.cause?.reason;

  console.log('Error code: ', error.code);
  console.log('Error reason: ', reason);

  console.log('Error object: ', JSON.stringify(error));

  const code = error.code != undefined ? error.code : error.cause?.code;

  if (code === 4001) {
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
      showErrorMessage('Oops, an error ocurred. ' + error.data.message);
    } else {
      showErrorMessage('Oops, an Internal JSON RPC error occurred. ');
    }
  } else if (code === 'ACTION_REJECTED') {
    showErrorMessage('You rejected the request. 😢');
  } else if (error.message === Errors.NGLZ_NO_ETH_WALLET) {
    showErrorMessage('No crypto wallet detected. Please install MetaMask or Coinbase Wallet.');
  } else if (code === 'UNSUPPORTED_OPERATION' && error.message.startsWith('unknown account')) {
    showErrorMessage('You need to connect an Ethereum wallet like MetaMask or Coinbase Wallet.');
  } else if (code === 'NO_POLICY_RESULTS' || code === 'POLICY_BLOCKED') {
    showErrorMessage('This transaction is not allowed by anglez security policy.');
  } else if (error.message === Errors.NGLZ_NO_ETH_ACCOUNT) {
    showErrorMessage(
      'You need to connect an account via your crypto wallet before you can do that.'
    );
  } else if (error.message === Errors.NGLZ_WRONG_ETH_NETWORK) {
    const errorMessage =
      "You're on the wrong network. Tap here to switch to " + AnglezCurrentNetworkName + '.';
    const onClose = switchToCurrentNetwork;
    showErrorMessage(errorMessage, onClose);
    // showErrorMessage(errorMessage);
  } else if (error.message === Errors.NGLZ_SEED_USED) {
    showErrorMessage('This random seed has already been used! Randomize or refresh and try again.');
  } else if (reason == 'SEED_USED') {
    showErrorMessage('This random seed has already been used! Randomize or refresh and try again.');
  } else if (error.code != null) {
    showErrorMessage('An error occurred: ' + error.code + '.');
  } else {
    showErrorMessage('An error occurred.');
  }
}
