import { apiGet } from './api';

const parseTimestamp = (value) => {
  if (!value) {
    return 0;
  }
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

const sanitizeMessageText = (text) => {
  if (!text) {
    return '';
  }
  return String(text).replace(/\s+/g, ' ').trim();
};

export const truncateText = (text, maxLength = 80) => {
  const sanitized = sanitizeMessageText(text);
  if (!sanitized) {
    return '';
  }
  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}…`
    : sanitized;
};

export const fetchLatestMessageSummary = async () => {
  try {
    const conversationsResponse = await apiGet('/api/messages/conversations');
    if (
      conversationsResponse.success &&
      Array.isArray(conversationsResponse.data) &&
      conversationsResponse.data.length > 0
    ) {
      const conversations = conversationsResponse.data.filter(Boolean);
      if (conversations.length === 0) {
        return null;
      }

      const sortedConversations = [...conversations].sort((a, b) => {
        const aTime = parseTimestamp(a.last_message_at || a.updated_at || a.created_at);
        const bTime = parseTimestamp(b.last_message_at || b.updated_at || b.created_at);
        return bTime - aTime;
      });

      const latestConversation = sortedConversations[0];
      if (!latestConversation) {
        return null;
      }

      const senderName = sanitizeMessageText(latestConversation.other_user_name) || '新着メッセージ';
      let messageText =
        sanitizeMessageText(
          latestConversation.last_message ||
          latestConversation.latest_message ||
          latestConversation.last_message_preview ||
          latestConversation.message
        ) || '';

      if (!messageText && latestConversation.other_user_id) {
        try {
          const messagesResponse = await apiGet(`/api/messages/conversation/${latestConversation.other_user_id}`);
          if (
            messagesResponse.success &&
            Array.isArray(messagesResponse.data) &&
            messagesResponse.data.length > 0
          ) {
            const latestMessage = messagesResponse.data[messagesResponse.data.length - 1];
            messageText = sanitizeMessageText(latestMessage?.message);
          }
        } catch (error) {
          console.error('個別会話の取得に失敗しました:', error);
        }
      }

      return {
        senderName,
        messageText,
      };
    }
  } catch (error) {
    console.error('最新メッセージ概要の取得に失敗しました:', error);
  }

  return null;
};

export default {
  fetchLatestMessageSummary,
  truncateText,
};

