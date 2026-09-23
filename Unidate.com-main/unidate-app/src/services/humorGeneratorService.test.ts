jest.mock('../supabaseClient', () => ({ supabase: { from: jest.fn() } }));

import { supabase } from '../supabaseClient';
import { HumorGeneratorService } from './humorGeneratorService';

const mockFrom = supabase.from as jest.Mock;

describe('HumorGeneratorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const query: any = {};
    query.select = jest.fn(() => query);
    query.order = jest.fn(() => query);
    query.limit = jest.fn().mockResolvedValue({ data: [], error: null });
    mockFrom.mockReturnValue(query);
  });

  test('generates a safe, non-empty candidate within the configured size', async () => {
    const candidate = await HumorGeneratorService.generatePost();
    expect(candidate.text.trim()).not.toBe('');
    expect(candidate.text.length).toBeLessThanOrEqual(300);
    expect(candidate.topic).toBeTruthy();
    expect(candidate.format).toBeTruthy();
    expect(candidate.text).not.toMatch(/suicid|racis|homofob|telefone|cpf/i);
  });

  test('keeps replies short and contextual', async () => {
    await expect(HumorGeneratorService.generateReply('tenho prova amanhã')).resolves.toContain('separa a matéria');
    await expect(HumorGeneratorService.generateReply('fiquei com 5,9')).resolves.toContain('Nota apertada');
  });
});
