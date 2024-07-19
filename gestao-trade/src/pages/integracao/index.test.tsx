import { render, screen } from '@testing-library/react';
import Integracao from '.';

test('renders learn react link', () => {
  render(<Integracao />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
