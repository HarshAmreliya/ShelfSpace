/**
 * Multi-session chat feature.
 *
 * Adds full session lifecycle controls on top of chat UI:
 * - create/switch/delete sessions
 * - pin/unpin sessions
 * - rename session titles
 */
"use client";

import ReactMarkdown from "react-markdown";
import { useRef, useEffect } from "react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ChatErrorFallback } from "@/components/common/ErrorFallbacks/ChatErrorFallback";
import { useChatSessions } from "@/hooks/chat/useChatSessions";
import { useChatFeatureWithSessionsUI } from "@/hooks/chat/useChatFeatureWithSessionsUI";
import {
  Send,
  Trash2,
  BookOpen,
  User,
  Menu,
  X,
  Plus,
  Pin,
  Edit2,
  Check,
  Clock
} from "lucide-react";

export interface ChatFeatureProps {
  className?: string;
}

/**
 * Renders chat interface backed by persistent chat sessions.
 *
 * @param className Optional wrapper className.
 */
export function ChatFeatureWithSessions({ className }: ChatFeatureProps) {
  const {
    sessions,
    currentSession,
    messages,
    inputMessage,
    isTyping,
    isLoading,
    error,
    actions,
  } = useChatSessions();

  const {
    isHistoryOpen,
    setIsHistoryOpen,
    editingSessionId,
    setEditingSessionId,
    editTitle,
    setEditTitle,
    handleSendMessage,
    handleNewChat,
    handleDeleteSession,
    handleTogglePin,
    startEditingTitle,
    saveTitle,
    formatTimestamp,
  } = useChatFeatureWithSessionsUI({
    inputMessage,
    actions,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <ErrorBoundary fallback={ChatErrorFallback}>
      <div
        className={`h-full bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 ${
          className || ""
        }`}
      >
        {/* On mobile: no outer padding so chat fills the full height */}
        <div className="h-full sm:p-4 lg:p-6">
          <div className="h-full bg-white/90 dark:bg-slate-800/95 backdrop-blur-sm sm:rounded-2xl shadow-xl border-0 sm:border border-amber-200 dark:border-slate-700 overflow-hidden flex relative">

            {/* Chat History Sidebar — full-screen drawer on mobile, side panel on sm+ */}
            {isHistoryOpen && (
              <>
                {/* Mobile backdrop */}
                <div
                  className="absolute inset-0 z-10 bg-black/40 sm:hidden"
                  onClick={() => setIsHistoryOpen(false)}
                />
                <div className="absolute inset-y-0 left-0 z-20 w-4/5 max-w-xs sm:static sm:z-auto sm:w-72 sm:max-w-none border-r border-amber-200 dark:border-slate-700 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 flex flex-col">
                  <div className="p-4 border-b border-amber-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white font-serif">
                        Chat History
                      </h3>
                      <button
                        onClick={() => setIsHistoryOpen(false)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-amber-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleNewChat}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      New Chat
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                    {sessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No chat history yet</p>
                        <p className="text-xs mt-1">Start a new conversation!</p>
                      </div>
                    ) : (
                      sessions.map((session) => (
                        <div
                          key={session.id}
                          onClick={() => {
                            actions.switchSession(session.id);
                            setIsHistoryOpen(false);
                          }}
                          className={`group p-3 rounded-lg cursor-pointer transition-all ${
                            currentSession?.id === session.id
                              ? "bg-amber-200 dark:bg-slate-600 shadow-sm"
                              : "bg-white dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-slate-600"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {editingSessionId === session.id ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") saveTitle(session.id);
                                      if (e.key === "Escape") setEditingSessionId(null);
                                    }}
                                    className="flex-1 px-2 py-1 text-sm border border-amber-300 rounded"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      saveTitle(session.id);
                                    }}
                                    className="p-1 hover:bg-amber-300 dark:hover:bg-slate-500 rounded"
                                  >
                                    <Check className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {session.title}
                                </h4>
                              )}
                              <div className="flex items-center gap-1.5 mt-1">
                                <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                                  {formatTimestamp(session.lastMessageAt)}
                                </p>
                              </div>
                            </div>
                            {/* Action buttons — always visible on mobile, hover on desktop */}
                            <div className="flex items-center gap-0.5 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {session.isPinned && (
                                <Pin className="h-3 w-3 text-amber-600 dark:text-amber-400 fill-current" />
                              )}
                              <button
                                onClick={(e) => handleTogglePin(session.id, e)}
                                className="p-1.5 hover:bg-amber-300 dark:hover:bg-slate-500 rounded transition-colors"
                                title={session.isPinned ? "Unpin" : "Pin"}
                              >
                                <Pin className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => startEditingTitle(session.id, session.title, e)}
                                className="p-1.5 hover:bg-amber-300 dark:hover:bg-slate-500 rounded transition-colors"
                                title="Rename"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteSession(session.id, e)}
                                className="p-1.5 hover:bg-red-200 dark:hover:bg-red-900 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 dark:from-slate-700 dark:to-slate-600 px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                    <div className="p-1.5 sm:p-2 bg-white/20 dark:bg-slate-500/30 rounded-lg flex-shrink-0">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-lg font-semibold text-white font-serif truncate">
                        {currentSession?.title || "ShelfAI"}
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-100 dark:text-slate-300 hidden sm:block">
                        Your literary companion
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <button
                      onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 dark:hover:bg-slate-500/30 transition-colors rounded-lg"
                      title="Chat history"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleNewChat}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 dark:hover:bg-slate-500/30 transition-colors rounded-lg"
                      title="New chat"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => actions.clearCurrentSession()}
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 dark:hover:bg-slate-500/30 transition-colors rounded-lg"
                      title="Clear conversation"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-6">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-lg mb-4 sm:mb-6">
                        <BookOpen className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2 sm:mb-3 font-serif">
                        Welcome to ShelfAI
                      </h3>
                      <p className="text-sm sm:text-lg text-gray-600 dark:text-slate-300 italic">
                        "The more that you read, the more things you will know."
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-2">
                        Ask me anything about books, get recommendations, or discuss your favorite reads!
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={`${message.timestamp}-${index}`}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-start gap-2 max-w-[88%] sm:max-w-3xl ${
                          message.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-amber-400 to-orange-500"
                              : "bg-gradient-to-br from-blue-400 to-indigo-500"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          ) : (
                            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                          )}
                        </div>
                        <div
                          className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30"
                              : "bg-white dark:bg-slate-700 shadow-md"
                          }`}
                        >
                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm sm:text-base">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[88%] sm:max-w-3xl">
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div className="flex-1 px-3 sm:px-4 py-3 rounded-2xl bg-white dark:bg-slate-700 shadow-md min-w-[160px]">
                        <div className="space-y-2 animate-pulse">
                          <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded-full w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded-full w-full" />
                          <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded-full w-1/2" />
                        </div>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">ShelfAI is thinking...</p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />

                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-3 sm:p-4 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-amber-200 dark:border-slate-700 p-3 sm:p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-slate-800/50 dark:to-slate-700/50 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
                  <div className="flex-1">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => actions.setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Ask about books, get recommendations..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-amber-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      rows={1}
                      disabled={isLoading || isTyping}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading || isTyping}
                    className="px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2 shadow-lg flex-shrink-0"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline text-sm">Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default ChatFeatureWithSessions;
