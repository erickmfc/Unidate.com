import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import TermsAcceptanceModal from './TermsAcceptanceModal';
import { acceptTerms } from '../../services/termsAcceptanceService';

jest.mock('../../services/termsAcceptanceService', () => ({
  TERMS_VERSION: '2026-09-22',
  acceptTerms: jest.fn(),
}));

describe('TermsAcceptanceModal', () => {
  beforeEach(() => jest.clearAllMocks());

  test('requires an explicit checkbox before accepting', async () => {
    const onAccepted = jest.fn();
    (acceptTerms as jest.Mock).mockResolvedValue(undefined);

    render(<TermsAcceptanceModal userId="user-1" onAccepted={onAccepted} />);

    const acceptButton = screen.getByTestId('terms-accept-button');
    expect(acceptButton).toBeDisabled();

    fireEvent.click(screen.getByTestId('terms-checkbox'));
    expect(acceptButton).not.toBeDisabled();
    fireEvent.click(acceptButton);

    await waitFor(() => expect(acceptTerms).toHaveBeenCalledWith('user-1'));
    await waitFor(() => expect(onAccepted).toHaveBeenCalledTimes(1));
  });
});
