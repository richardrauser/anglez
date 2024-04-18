import { showErrorMessage } from './UIUtils';
import * as Errors from './ErrorMessages';
import { CosmicWorldsCurrentNetworkName } from './Constants';
import { switchToCurrentNetwork } from './BlockchainAPI';

export function handleError(error: any) {
  console.log('Handling error ' + error.code + ': ' + error.message);

  if (error.code === 4001) {
    showErrorMessage('You rejected the transaction. :-(');
  } else if (error.code === -32002) {
    // -32002: already requesting accounts
    showErrorMessage('Already requesting accounts. Please open MetaMask to confirm.');
  } else if (error.code === -32603) {
    // Internal JSON RPC error
    if (error.data != null && error.data.message != null) {
      showErrorMessage('Oops, an error ocurred. ' + error.data.message);
    } else {
      showErrorMessage('Oops, an Internal JSON RPC error occurred. ');
    }
  } else if (error.code === 'ACTION_REJECTED') {
    showErrorMessage('You rejected the transaction.');
  } else if (error.message === Errors.DS_NO_ETH_WALLET) {
    showErrorMessage('No crypto wallet detected. Please install MetaMask.');
  } else if (
    error.code === 'UNSUPPORTED_OPERATION' &&
    error.message.startsWith('unknown account')
  ) {
    showErrorMessage('You need to connect an Ethereum wallet like MetaMask.');
  } else if (error.message === Errors.DS_NO_ETH_ACCOUNT) {
    showErrorMessage(
      'You need to connect an account via your crypto wallet before you can do that.'
    );
  } else if (error.message === Errors.DS_WRONG_ETH_NETWORK) {
    const errorMessage =
      "You're on the wrong network. Please switch to " + CosmicWorldsCurrentNetworkName + '.';
    // const onClose = switchToCurrentNetwork;
    const onClose = null;
    showErrorMessage(errorMessage, onClose);
  } else if (error.code != null) {
    showErrorMessage('An error occurred: (' + error.code + ') ' + error.message);
  } else {
    showErrorMessage('An error occurred.');
  }
}
