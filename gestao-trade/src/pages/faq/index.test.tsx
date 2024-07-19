import { render, screen } from '@testing-library/react';
import FAQ from '.';

test('renders learn react link', () => {
  render(<FAQ />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
