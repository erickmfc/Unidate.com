import React from 'react';
import { act, render, screen } from '@testing-library/react';
import TermsAcceptanceGate, { TERMS_DELAY_MS } from './TermsAcceptanceGate';
import { useAuth } from '../../contexts/AuthContext';
import { hasAcceptedTerms } from '../../services/termsAcceptanceService';

jest.mock('../../contexts/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/termsAcceptanceService', () => ({ hasAcceptedTerms: jest.fn() }));
jest.mock('./TermsAcceptanceModal', () => ({ userId }: { userId: string }) => (
  <div data-testid="terms-acceptance-modal">Termos para {userId}</div>
));

describe('TermsAcceptanceGate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      currentUser: { id: 'user-1' },
      isAuthenticated: true,
      loading: false,
    });
    (hasAcceptedTerms as jest.Mock).mockResolvedValue(false);
  });

  afterEach(() => jest.useRealTimers());

  test('opens the full-screen terms after ten seconds for an unaccepted user', async () => {
    render(<TermsAcceptanceGate />);
    expect(screen.queryByTestId('terms-acceptance-modal')).not.toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(TERMS_DELAY_MS);
      await Promise.resolve();
    });

    expect(hasAcceptedTerms).toHaveBeenCalledWith('user-1');
    expect(screen.getByTestId('terms-acceptance-modal')).toHaveTextContent('user-1');
  });
});
