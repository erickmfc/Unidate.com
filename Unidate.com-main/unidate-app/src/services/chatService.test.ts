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
    mockRpc.mockResolvedValue({ data: 'message-1', error: null });

    await expect(ChatService.sendMessage('chat-1', 'me', 'Matheus', 'Olá!')).resolves.toBe('message-1');
    expect(mockRpc).toHaveBeenCalledWith('send_chat_message', {
      target_chat_id: 'chat-1',
      message_content: 'Olá!',
      message_type: 'text',
      reply_to_message_id: null,
    });
  });
});
