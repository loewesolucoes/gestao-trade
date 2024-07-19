import { render, screen } from '@testing-library/react';
import Configuracoes from '.';

test('renders learn react link', () => {
  render(<Configuracoes />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
