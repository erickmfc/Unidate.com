jest.mock('../supabaseClient', () => ({
  supabase: {
    auth: { getSession: jest.fn() },
    from: jest.fn()
  }
}));

import { PostsService } from './postsService';
import { AppCache } from '../utils/cache';
import { supabase } from '../supabaseClient';

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

const makeQuery = (result: any) => {
  const query: any = {};
  query.select = jest.fn(() => query);
  query.order = jest.fn(() => query);
  query.limit = jest.fn(() => query);
  query.in = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.then = (resolve: (value: any) => unknown, reject: (reason: any) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return query;
};

describe('PostsService.getPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AppCache.clear();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'current-user' } } }
    });
  });

  test('keeps posts visible when profile and like lookups fail', async () => {
    const postRow = {
      id: 'post-1',
      author_id: 'author-1',
      content: 'Publicação de teste',
      type: 'text',
      likes_count: 0,
      comments_count: 0,
      hashtags: [],
      created_at: '2026-09-22T12:00:00.000Z',
      updated_at: '2026-09-22T12:00:00.000Z'
    };

    mockFrom.mockImplementation((table: string) => {
      if (table === 'posts') return makeQuery({ data: [postRow], error: null });
      return makeQuery({ data: null, error: new Error(`${table} read failed`) });
    });

    const posts = await PostsService.getPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe('post-1');
    expect(posts[0].author.uid).toBe('author-1');
    expect(posts[0].author.name).toBe('Usuário');
    expect(posts[0].isLiked).toBe(false);
  });

  test('reports errors from the posts query instead of presenting an empty feed', async () => {
    mockFrom.mockReturnValue(makeQuery({ data: null, error: new Error('posts read failed') }));

    await expect(PostsService.getPosts()).rejects.toThrow('posts read failed');
  });
});
