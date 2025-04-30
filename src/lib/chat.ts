import { supabase } from './supabase';
import type { Database } from '../types/supabase';

export type Message = Database['public']['Tables']['messages']['Row'] & {
  sender: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  receiver: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
};

export const fetchMessages = async (chatId: string, page = 1, pageSize = 20) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        receiver_id,
        is_read,
        sender:profiles!messages_sender_id_fkey(id, name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, name, avatar_url)
      `)
      .or(`sender_id.eq.${chatId},receiver_id.eq.${chatId}`)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (chatId: string, content: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: chatId,
          content,
        },
      ])
      .select(`
        id,
        content,
        created_at,
        sender_id,
        receiver_id,
        is_read,
        sender:profiles!messages_sender_id_fkey(id, name, avatar_url),
        receiver:profiles!messages_receiver_id_fkey(id, name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const markMessageAsRead = async (chatId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', chatId)
      .eq('is_read', false);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
};

export const subscribeToMessages = (chatId: string, callback: (message: Message) => void) => {
  return supabase
    .channel(`messages:${chatId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${chatId} OR receiver_id=eq.${chatId}`,
      },
      async (payload) => {
        const { data: message, error } = await supabase
          .from('messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            receiver_id,
            is_read,
            sender:profiles!messages_sender_id_fkey(id, name, avatar_url),
            receiver:profiles!messages_receiver_id_fkey(id, name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && message) {
          callback(message);
        }
      }
    )
    .subscribe();
};

export const getUnreadCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

export const deleteMessage = async (messageId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};
 