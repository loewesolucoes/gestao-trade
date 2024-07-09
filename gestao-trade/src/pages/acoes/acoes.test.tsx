import { render, screen } from '@testing-library/react';
import { Acoes } from './acoes';

test('renders learn react link', () => {
  render(<Acoes />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
