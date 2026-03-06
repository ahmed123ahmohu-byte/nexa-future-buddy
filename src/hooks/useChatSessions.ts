import { useState, useEffect, useCallback } from 'react';

export interface ChatSession {
  id: string;
  title: string;
  messages: { id: string; role: 'user' | 'assistant'; content: string }[];
  createdAt: number;
}

const STORAGE_KEY = 'nexa-sessions';

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useChatSessions(userName: string) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const existing = loadSessions();
    if (existing.length > 0) return existing;
    // Migrate old single chat
    const oldChat = localStorage.getItem('nexa-chat');
    const initial: ChatSession = {
      id: Date.now().toString(),
      title: 'محادثة جديدة',
      messages: oldChat ? JSON.parse(oldChat) : [{
        id: '1', role: 'assistant',
        content: `أهلاً يا ${userName} 👋\nمستعد نبدأ ونبني المستقبل؟ 🚀`,
      }],
      createdAt: Date.now(),
    };
    return [initial];
  });

  const [activeId, setActiveId] = useState<string>(() => {
    const s = loadSessions();
    return s.length > 0 ? s[0].id : sessions[0]?.id || '';
  });

  useEffect(() => {
    saveSessions(sessions);
    localStorage.removeItem('nexa-chat'); // cleanup old format
  }, [sessions]);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0];

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'محادثة جديدة',
      messages: [{
        id: '1', role: 'assistant',
        content: `أهلاً يا ${userName} 👋\nكيف يمكنني مساعدتك؟ 🚀`,
      }],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveId(newSession.id);
  }, [userName]);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (filtered.length === 0) {
        const fresh: ChatSession = {
          id: Date.now().toString(), title: 'محادثة جديدة',
          messages: [{ id: '1', role: 'assistant', content: `أهلاً يا ${userName} 👋` }],
          createdAt: Date.now(),
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(filtered[0].id);
      return filtered;
    });
  }, [activeId, userName]);

  const updateMessages = useCallback((id: string, messages: ChatSession['messages']) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== id) return s;
      // Auto-title from first user message
      const firstUser = messages.find(m => m.role === 'user');
      const title = firstUser ? firstUser.content.slice(0, 30) + (firstUser.content.length > 30 ? '...' : '') : s.title;
      return { ...s, messages, title };
    }));
  }, []);

  return { sessions, activeSession, activeId, setActiveId, createSession, deleteSession, updateMessages };
}
