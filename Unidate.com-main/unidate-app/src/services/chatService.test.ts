jest.mock('../supabaseClient', () => ({
  supabase: {
    rpc: jest.fn(),
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'me' } } }) },
    from: jest.fn()
  }
}));

import { supabase } from '../supabaseClient';
import { ChatService } from './chatService';

const mockRpc = supabase.rpc as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

describe('ChatService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('opens a direct chat through the protected database function', async () => {
    mockRpc.mockResolvedValue({ data: 'chat-1', error: null });

    await expect(ChatService.getOrCreateChat('me', 'friend')).resolves.toBe('chat-1');
    expect(mockRpc).toHaveBeenCalledWith('create_direct_chat', { target_user_id: 'friend' });
  });

  test('sends a message and updates the conversation preview', async () => {
    const messageQuery: any = {};
    messageQuery.insert = jest.fn(() => messageQuery);
    messageQuery.select = jest.fn(() => messageQuery);
    messageQuery.single = jest.fn().mockResolvedValue({ data: { id: 'message-1' }, error: null });

    const chatQuery: any = {};
    chatQuery.update = jest.fn(() => chatQuery);
    chatQuery.eq = jest.fn().mockResolvedValue({ error: null });

    mockFrom.mockImplementation((table: string) => table === 'messages' ? messageQuery : chatQuery);

    await expect(ChatService.sendMessage('chat-1', 'me', 'Matheus', 'Olá!')).resolves.toBe('message-1');
    expect(messageQuery.insert).toHaveBeenCalledWith(expect.objectContaining({
      chat_id: 'chat-1', sender_id: 'me', content: 'Olá!'
    }));
    expect(chatQuery.update).toHaveBeenCalledWith(expect.objectContaining({ last_message: 'Olá!' }));
  });
});
