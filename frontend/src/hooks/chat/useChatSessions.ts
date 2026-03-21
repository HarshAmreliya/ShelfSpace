"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { chatService, ChatSession, ChatMessage } from "@/lib/chat-service";

/**
 * Use Chat Sessions.
 */
export function useChatSessions() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Prevents the session-change effect from clobbering optimistic messages mid-send
  const isSendingRef = useRef(false);

  // Load sessions on mount
  useEffect(() => {
    if (session?.accessToken) {
      loadSessions();
    }
  }, [session]);

  // Load specific session when currentSession changes (skip if mid-send to avoid clobbering optimistic messages)
  useEffect(() => {
    if (currentSession && session?.accessToken && !isSendingRef.current) {
      loadSessionMessages(currentSession.id);
    }
  }, [currentSession?.id, session]);

  /**
   * Load all sessions for the user
   */
/**
 * Load Sessions.
 */
  const loadSessions = async () => {
    if (!session?.accessToken) {
      setError("Please log out and log back in to use chat features");
      return;
    }

    try {
      const sessionList = await chatService.getSessions(session.accessToken, {
        limit: 50,
        includePinned: true,
      });
      setSessions(Array.isArray(sessionList) ? sessionList : []);
    } catch {
      setError("Failed to load chat history");
      setSessions([]);
    }
  };

  /**
   * Load messages for a specific session
   */
/**
 * Load Session Messages.
 * @param sessionId - session Id value.
 */
  const loadSessionMessages = async (sessionId: string) => {
    if (!session?.accessToken) return;

    try {
      setIsLoading(true);
      const sessionData = await chatService.getSession(session.accessToken, sessionId);
      const messagesList = Array.isArray(sessionData.messages) ? sessionData.messages : [];
      setMessages(messagesList);
      setCurrentSession(sessionData);
    } catch (err: any) {
      if (err.response?.status === 410) {
        setError("This chat session has expired");
      } else {
        setError("Failed to load messages");
      }
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new chat session
   */
/**
 * Create New Session.
 * @param title - title value.
 */
  const createNewSession = async (title?: string) => {
    if (!session?.accessToken) return null;

    try {
      const newSession = await chatService.createSession(
        session.accessToken,
        title ? { title } : undefined
      );
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSession(newSession);
      setMessages([]);
      return newSession;
    } catch (err) {
      setError("Failed to create new chat");
      return null;
    }
  };

  /**
   * Send a message in the current session
   */
/**
 * Send Message.
 * @param content - content value.
 */
  const sendMessage = async (content?: string) => {
    const messageText = content || inputMessage;
    if (!messageText.trim() || !session?.accessToken) return;

    isSendingRef.current = true;
    try {
      setError(null);

      // Create session if none exists
      let sessionId = currentSession?.id;
      if (!sessionId) {
        const newSession = await createNewSession();
        if (!newSession) return;
        sessionId = newSession.id;
      }

      // Clear input and show user message immediately
      setInputMessage("");
      const optimisticUserMsg: ChatMessage = {
        role: "user",
        content: messageText,
        timestamp: Date.now().toString(),
      };
      setMessages((prev) => [...(Array.isArray(prev) ? prev : []), optimisticUserMsg]);
      setIsTyping(true);

      // Send message and get bot response
      const { botMsg } = await chatService.sendChatMessage(
        session.accessToken,
        sessionId,
        messageText
      );

      setMessages((prev) => [...(Array.isArray(prev) ? prev : []), botMsg]);

      // Update session title if it's the first message
      if (messages.length === 0 && currentSession) {
        const title = chatService.generateTitle(messageText);
        // await chatService.updateSession(session.accessToken, sessionId, { title });
        
        // Update local session
        setCurrentSession((prev) => prev ? { ...prev, title } : null);
        setSessions((prev) =>
          (Array.isArray(prev) ? prev : []).map((s) => (s.id === sessionId ? { ...s, title } : s))
        );
      }

      // Update lastMessageAt in sessions list
      setSessions((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) =>
          s.id === sessionId
            ? { ...s, lastMessageAt: new Date().toISOString() }
            : s
        )
      );
    } catch {
      setError("Failed to send message");
    } finally {
      setIsTyping(false);
      isSendingRef.current = false;
    }
  };

  /**
   * Switch to a different session
   */
/**
 * Switch Session.
 * @param sessionId - session Id value.
 */
  const switchSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      await loadSessionMessages(sessionId);
    }
  };

  /**
   * Delete a session
   */
/**
 * Delete Session.
 * @param sessionId - session Id value.
 */
  const deleteSession = async (sessionId: string) => {
    if (!session?.accessToken) return;

    try {
      await chatService.deleteSession(session.accessToken, sessionId);
      setSessions((prev) => (Array.isArray(prev) ? prev : []).filter((s) => s.id !== sessionId));

      // If deleting current session, clear it
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      setError("Failed to delete chat");
    }
  };

  /**
   * Pin/unpin a session
   */
/**
 * Toggle Pin.
 * @param sessionId - session Id value.
 */
  const togglePin = async (sessionId: string) => {
    if (!session?.accessToken) return;

    const sessionToUpdate = sessions.find((s) => s.id === sessionId);
    if (!sessionToUpdate) return;

    try {
      await chatService.updateSession(session.accessToken, sessionId, {
        isPinned: !sessionToUpdate.isPinned,
      });

      setSessions((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) =>
          s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s
        )
      );
    } catch (err) {
      setError("Failed to update chat");
    }
  };

  /**
   * Rename a session
   */
/**
 * Rename Session.
 * @param sessionId - session Id value.
 * @param newTitle - new Title value.
 */
  const renameSession = async (sessionId: string, newTitle: string) => {
    if (!session?.accessToken) return;

    try {
      await chatService.updateSession(session.accessToken, sessionId, {
        title: newTitle,
      });

      setSessions((prev) =>
        (Array.isArray(prev) ? prev : []).map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s))
      );

      if (currentSession?.id === sessionId) {
        setCurrentSession((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
    } catch (err) {
      setError("Failed to rename chat");
    }
  };

  /**
   * Clear current session (start fresh)
   */
/**
 * Clear Current Session.
 */
  const clearCurrentSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setInputMessage("");
  };

  return {
    // State
    sessions,
    currentSession,
    messages,
    inputMessage,
    isTyping,
    isLoading,
    error,

    // Actions
    actions: {
      setInputMessage,
      sendMessage,
      createNewSession,
      switchSession,
      deleteSession,
      togglePin,
      renameSession,
      clearCurrentSession,
      loadSessions,
      refreshSession: loadSessionMessages,
    },
  };
}
