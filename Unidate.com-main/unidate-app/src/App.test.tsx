import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders the UniDate landing page', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText(/comunidade universitária/i)).toBeInTheDocument();
  });
});
