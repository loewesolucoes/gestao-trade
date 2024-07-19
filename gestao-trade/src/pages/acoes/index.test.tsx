import { render, screen } from '@testing-library/react';
import AcoesPage from '.';

test('renders learn react link', () => {
  render(<AcoesPage />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
