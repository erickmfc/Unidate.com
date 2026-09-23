jest.mock('../supabaseClient', () => ({
  supabase: { from: jest.fn() }
}));

import { supabase } from '../supabaseClient';
import { acceptTerms, hasAcceptedTerms, TERMS_VERSION } from './termsAcceptanceService';

const mockFrom = supabase.from as jest.Mock;

describe('termsAcceptanceService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('checks the current terms version for the authenticated person', async () => {
    const query: any = {};
    query.select = jest.fn(() => query);
    query.eq = jest.fn(() => query);
    query.maybeSingle = jest.fn().mockResolvedValue({ data: { id: 'acceptance-1' }, error: null });
    mockFrom.mockReturnValue(query);

    await expect(hasAcceptedTerms('user-1')).resolves.toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('terms_acceptances');
    expect(query.eq).toHaveBeenNthCalledWith(1, 'user_id', 'user-1');
    expect(query.eq).toHaveBeenNthCalledWith(2, 'terms_version', TERMS_VERSION);
  });

  test('treats a concurrent duplicate acceptance as success', async () => {
    const insert = jest.fn().mockResolvedValue({ error: { code: '23505', message: 'duplicate key' } });
    mockFrom.mockReturnValue({ insert });

    await expect(acceptTerms('user-1')).resolves.toBeUndefined();
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-1',
      terms_version: TERMS_VERSION,
    }));
  });
});
