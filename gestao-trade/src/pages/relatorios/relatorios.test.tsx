import { render, screen } from '@testing-library/react';
import { Relatorios } from './relatorios';

test('renders learn react link', () => {
  render(<Relatorios />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
