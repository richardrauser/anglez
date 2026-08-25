import { render, screen, waitFor } from '@/test-utils';
import ArtworkView from './ArtworkView';
import { fetchTokenDetailsClient } from '@/src/TokenDetailsFetcher';

jest.mock('@/src/TokenDetailsFetcher', () => ({
  fetchTokenDetailsClient: jest.fn(),
}));

jest.mock('@/src/BlockchainAPI', () => ({
  shortenAddress: (a: string) => a,
}));

const mockFetch = fetchTokenDetailsClient as jest.MockedFunction<typeof fetchTokenDetailsClient>;

const details = {
  tokenId: 211,
  svg: '<svg xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1"/></svg>',
  owner: '0x0000000000000000000000000000000000000001',
  attributes: {
    seed: 2500750,
    isCustom: false,
    shapeCount: 7,
    style: 'linear',
    structure: 'chaotic',
    tintColor: 'rgb(87, 120, 218)',
    tintOpacity: 0.4,
  },
} as any;

describe('ArtworkView', () => {
  beforeEach(() => jest.clearAllMocks());

  // Regression test. The fetched details were briefly assigned back from the component's
  // own null state rather than from the fetch result, so the view never left its loading
  // state and no artwork ever rendered on /artwork/[id].
  it('renders the artwork once details resolve', async () => {
    mockFetch.mockResolvedValue(details);

    render(<ArtworkView id="211" />);

    const image = await screen.findByAltText('anglez artwork');
    expect(image).toBeInTheDocument();
    expect(image.getAttribute('src')).toContain('data:image/svg+xml,');
  });

  it('keeps showing the loading state when there are no details', async () => {
    mockFetch.mockResolvedValue(null as any);

    render(<ArtworkView id="211" />);

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(screen.queryByAltText('anglez artwork')).not.toBeInTheDocument();
  });
});
