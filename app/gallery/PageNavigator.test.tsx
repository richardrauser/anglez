import { render, screen } from '@/test-utils';
import userEvent from '@testing-library/user-event';
import { PageNavigator } from './PageNavigator';

// setPage receives an updater, so capture it and apply it to the current page to check
// the clamping actually holds at both ends.
function applyUpdater(setPage: jest.Mock, fromPage: number): number {
  const updater = setPage.mock.calls[0][0];
  return updater(fromPage);
}

describe('PageNavigator', () => {
  it('shows a human-readable, 1-based page position', () => {
    render(<PageNavigator page={0} totalPages={5} setPage={jest.fn()} />);

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('disables Previous on the first page', () => {
    render(<PageNavigator page={0} totalPages={5} setPage={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('disables Next on the last page', () => {
    render(<PageNavigator page={4} totalPages={5} setPage={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });

  it('disables both controls when there is only one page', () => {
    render(<PageNavigator page={0} totalPages={1} setPage={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('advances a page on Next', async () => {
    const setPage = jest.fn();
    render(<PageNavigator page={1} totalPages={5} setPage={setPage} />);

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(applyUpdater(setPage, 1)).toBe(2);
  });

  it('goes back a page on Previous', async () => {
    const setPage = jest.fn();
    render(<PageNavigator page={3} totalPages={5} setPage={setPage} />);

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(applyUpdater(setPage, 3)).toBe(2);
  });

  it('clamps forward navigation to the last page', async () => {
    const setPage = jest.fn();
    // Rendered mid-range so Next is clickable, but the updater must still clamp if the
    // page it is applied to is already at the end.
    render(<PageNavigator page={2} totalPages={5} setPage={setPage} />);

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(applyUpdater(setPage, 4)).toBe(4);
  });

  it('clamps backward navigation to the first page', async () => {
    const setPage = jest.fn();
    render(<PageNavigator page={2} totalPages={5} setPage={setPage} />);

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));

    expect(applyUpdater(setPage, 0)).toBe(0);
  });
});
