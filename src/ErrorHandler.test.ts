import {
  ContractFunctionExecutionError,
  TransactionExecutionError,
  UserRejectedRequestError,
} from 'viem';
import { handleError } from './ErrorHandler';
import { showErrorMessage } from './UIUtils';

jest.mock('./UIUtils', () => ({
  showErrorMessage: jest.fn(),
  showInfoMessage: jest.fn(),
}));

// switchToCurrentNetwork is only used as a toast callback, and BlockchainAPI reaches for
// window.ethereum at import time.
jest.mock('./BlockchainAPI', () => ({
  switchToCurrentNetwork: jest.fn(),
  shortenAddress: (a: string) => a,
}));

const mockShowErrorMessage = showErrorMessage as jest.Mock;

beforeEach(() => {
  mockShowErrorMessage.mockClear();
});

describe('handleError', () => {
  it('reports a wallet rejection nested inside viem wrapper errors', () => {
    // The exact shape wagmi's useWriteContract surfaces when the user hits Cancel:
    // ContractFunctionExecutionError -> TransactionExecutionError -> UserRejectedRequestError.
    // Only the innermost error carries code 4001, so anything that inspects just
    // `error.code` and `error.cause.code` reports a generic failure instead.
    const rejected = new UserRejectedRequestError(new Error('User rejected the request.') as any);
    const wrapped = new ContractFunctionExecutionError(
      new TransactionExecutionError(rejected, { account: null }) as any,
      { abi: [], functionName: 'mintRandom' }
    );

    handleError(wrapped);

    expect(mockShowErrorMessage).toHaveBeenCalledWith('You rejected the request. 😢');
  });

  it('finds a rejection code however deeply it is wrapped', () => {
    const deep = { cause: { cause: { cause: { code: 4001 } } } };

    handleError(deep);

    expect(mockShowErrorMessage).toHaveBeenCalledWith('You rejected the request. 😢');
  });

  it("still reports ethers' string rejection code", () => {
    handleError(Object.assign(new Error('rejected'), { code: 'ACTION_REJECTED' }));

    expect(mockShowErrorMessage).toHaveBeenCalledWith('You rejected the request. 😢');
  });

  it('reports insufficient funds found in the cause chain', () => {
    handleError({ cause: { code: 'INSUFFICIENT_FUNDS' } });

    expect(mockShowErrorMessage).toHaveBeenCalledWith(
      'Insufficient funds to pay for this transation. Please add more funds to your crypto wallet.'
    );
  });

  it('reports a used seed from a nested revert reason', () => {
    handleError({ cause: { reason: 'SEED_USED' } });

    expect(mockShowErrorMessage).toHaveBeenCalledWith(
      'This random seed has already been used! Randomize or refresh and try again.'
    );
  });

  it('falls back to a generic message when there is no code at all', () => {
    handleError(new Error('something went wrong'));

    expect(mockShowErrorMessage).toHaveBeenCalledWith('An error occurred.');
  });

  it('does not loop forever on a circular cause chain', () => {
    const a: any = new Error('a');
    const b: any = new Error('b');
    a.cause = b;
    b.cause = a;

    handleError(a);

    expect(mockShowErrorMessage).toHaveBeenCalledWith('An error occurred.');
  });
});
