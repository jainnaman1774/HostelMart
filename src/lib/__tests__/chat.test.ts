import { supabase } from '../supabase';
import { fetchMessages, sendMessage, markMessagesAsRead, getUnreadCount, deleteMessage } from '../chat';

// Mock the supabase client
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
  },
}));

describe('Chat Functions', () => {
  const mockUserId = 'user-123';
  const mockOtherUserId = 'user-456';
  const mockMessage = {
    id: 'msg-123',
    content: 'Hello!',
    sender_id: mockUserId,
    receiver_id: mockOtherUserId,
    created_at: new Date().toISOString(),
    is_read: false,
    sender: {
      id: mockUserId,
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchMessages', () => {
    it('should fetch messages between two users', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: [mockMessage], error: null }),
          }),
        }),
      });

      const messages = await fetchMessages(mockUserId, mockOtherUserId);
      expect(messages).toEqual([mockMessage]);
    });

    it('should handle errors when fetching messages', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          or: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: new Error('Failed to fetch') }),
          }),
        }),
      });

      await expect(fetchMessages(mockUserId, mockOtherUserId)).rejects.toThrow('Failed to fetch');
    });
  });

  describe('sendMessage', () => {
    it('should send a message successfully', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockMessage, error: null }),
          }),
        }),
      });

      const message = await sendMessage('Hello!', mockUserId, mockOtherUserId);
      expect(message).toEqual(mockMessage);
    });

    it('should handle errors when sending messages', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: new Error('Failed to send') }),
          }),
        }),
      });

      await expect(sendMessage('Hello!', mockUserId, mockOtherUserId)).rejects.toThrow('Failed to send');
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      });

      await expect(markMessagesAsRead(mockUserId, mockOtherUserId)).resolves.not.toThrow();
    });
  });

  describe('getUnreadCount', () => {
    it('should get the count of unread messages', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
            }),
          }),
        }),
      });

      const count = await getUnreadCount(mockUserId, mockOtherUserId);
      expect(count).toBe(5);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null }),
          }),
        }),
      });

      await expect(deleteMessage('msg-123', mockUserId)).resolves.not.toThrow();
    });
  });
}); 