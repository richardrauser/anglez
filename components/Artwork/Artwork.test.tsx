import { render, screen } from '@/test-utils';
import Artwork from './Artwork';
import { fetchTokenDetailsClient } from '@/src/TokenDetailsFetcher';

jest.mock('@/src/TokenDetailsFetcher', () => ({
  fetchTokenDetailsClient: jest.fn(),
}));

const mockFetch = fetchTokenDetailsClient as jest.MockedFunction<typeof fetchTokenDetailsClient>;

const details = {
  tokenId: 212,
  svgDataUri: 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E',
  attributes: {
    seed: 4367994,
    isCustom: false,
    shapeCount: 7,
    style: 'cyclic',
    structure: 'folded',
    tintColor: 'rgb(191, 62, 213)',
    tintOpacity: 0.4,
  },
} as any;

describe('Artwork card', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the artwork once details resolve', async () => {
    mockFetch.mockResolvedValue(details);
    render(<Artwork tokenId={212} />);
    expect(await screen.findByAltText('Artwork')).toBeInTheDocument();
  });

  // Regression test for uneven card margins. Mantine applies a negative inline margin to
  // every Card.Section unconditionally, but only restores it via inheritPadding when the
  // section also carries data-orientation - which Card injects into its direct children
  // only. Wrapping a section in a plain element therefore pulls it flush to the card's
  // edges on both sides, which is what made the artwork sit tight against the border.
  it('keeps every Card.Section a direct child, so inheritPadding applies', async () => {
    mockFetch.mockResolvedValue(details);
    const { container } = render(<Artwork tokenId={212} />);
    await screen.findByAltText('Artwork');

    // Deliberate container query: this asserts a layout contract in Mantine's own DOM
    // attributes, which has no accessible-query equivalent.
    // eslint-disable-next-line testing-library/no-container
    const sections = container.querySelectorAll('.mantine-Card-section');
    expect(sections.length).toBeGreaterThan(1);
    sections.forEach((section) => {
      expect(section.getAttribute('data-orientation')).toBe('vertical');
      expect(section.getAttribute('data-inherit-padding')).toBe('true');
    });
  });
});
