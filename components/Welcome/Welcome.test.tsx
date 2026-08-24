import { render, screen } from '@/test-utils';
import { Welcome } from './Welcome';

describe('Welcome component', () => {
  it('links the call to action at the create page', () => {
    render(<Welcome />);
    expect(screen.getByRole('link', { name: /Get started creating anglez/ })).toHaveAttribute(
      'href',
      '/create'
    );
  });

  it('links out to Base', () => {
    render(<Welcome />);
    expect(screen.getByText('Base')).toHaveAttribute('href', 'https://www.base.org/');
  });
});
