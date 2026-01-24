# Chat Storage Implementation Roadmap

## Overview
Store individual chat conversations for each user in the user-service database, keeping the chatbot-service unchanged. This allows users to maintain chat history, resume conversations, and manage multiple chat sessions.

---

## Phase 1: Database Schema Design

### 1.1 Add Chat Models to User Service Prisma Schema

**File**: `services/user-service/prisma/schema.prisma`

Add the following models:

```prisma
model ChatConversation {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title       String    @default("New Chat")
  isActive    Boolean   @default(true)
  isPinned    Boolean   @default(false)
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastMessageAt DateTime @default(now())
  
  messages    ChatMessage[]
  
  @@index([userId, lastMessageAt])
  @@index([userId, isPinned])
}

model ChatMessage {
  id              String           @id @default(uuid())
  conversationId  String
  conversation    ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  role            MessageRole
  content         String           @db.Text
  
  // Optional metadata
  bookContext     String?          // Book ID if message is about a specific book
  metadata        Json?            // Additional context (e.g., search results, recommendations)
  
  createdAt       DateTime         @default(now())
  
  @@index([conversationId, createdAt])
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

**Update User model** to include the relation:

```prisma
model User {
  id          String       @id @default(uuid())
  email       String       @unique
  name        String?
  avatarUrl   String?
  bio         String?
  website     String?
  isPublic    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  status      UserStatus   @default(ACTIVE)

  preferences     Preferences?
  stats           UserStats?
  goals           UserGoal[]
  badges          UserBadge[]
  conversations   ChatConversation[]  // NEW
}
```

### 1.2 Run Migration

```bash
cd services/user-service
npx prisma migrate dev --name add_chat_storage
npx prisma generate
```

---

## Phase 2: Backend API Implementation

### 2.1 Create Chat Routes

**File**: `services/user-service/src/routes/chat.routes.ts`

```typescript
import express from "express";
import prisma from "../prisma.js";
import { isAuthenticated } from "../middlewares/auth.js";
import type { Request, Response } from "express";
import * as cache from "../utils/cache.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// GET /api/chat/conversations - List all conversations for user
router.get("/conversations", async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const conversations = await prisma.chatConversation.findMany({
      where: { userId: req.userId },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { lastMessageAt: 'desc' }
      ],
      take: Number(limit),
      skip: Number(offset)
    });
    
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/chat/conversations - Create new conversation
router.post("/conversations", async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    
    const conversation = await prisma.chatConversation.create({
      data: {
        userId: req.userId!,
        title: title || "New Chat"
      }
    });
    
    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/chat/conversations/:id - Get conversation with messages
router.get("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const conversation = await prisma.chatConversation.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    
    res.json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/chat/conversations/:id/messages - Add message to conversation
router.post("/conversations/:id/messages", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role, content, bookContext, metadata } = req.body;
    
    // Verify conversation belongs to user
    const conversation = await prisma.chatConversation.findFirst({
      where: { id, userId: req.userId }
    });
    
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    
    const message = await prisma.chatMessage.create({
      data: {
        conversationId: id,
        role,
        content,
        bookContext,
        metadata
      }
    });
    
    // Update conversation's lastMessageAt
    await prisma.chatConversation.update({
      where: { id },
      data: { lastMessageAt: new Date() }
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/chat/conversations/:id - Update conversation (title, pin, etc.)
router.patch("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, isPinned, isActive } = req.body;
    
    const conversation = await prisma.chatConversation.updateMany({
      where: { id, userId: req.userId },
      data: {
        ...(title !== undefined && { title }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isActive !== undefined && { isActive })
      }
    });
    
    if (conversation.count === 0) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/chat/conversations/:id - Delete conversation
router.delete("/conversations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await prisma.chatConversation.deleteMany({
      where: { id, userId: req.userId }
    });
    
    if (result.count === 0) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
```

### 2.2 Register Chat Routes

**File**: `services/user-service/src/index.ts`

Add the import and mount the routes:

```typescript
import chatRoutes from "./routes/chat.routes.js";

// ... existing code ...

app.use("/api/chat", chatRoutes);  // Add this line
```

---

## Phase 3: Frontend Integration

### 3.1 Create Chat Service

**File**: `frontend/src/lib/chat-service.ts`

```typescript
import axios from "axios";

const CHAT_API_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:3001/api";

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  isActive: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messages?: ChatMessage[];
  _count?: {
    messages: number;
  };
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  bookContext?: string;
  metadata?: any;
  createdAt: string;
}

class ChatService {
  private getAuthHeaders() {
    // This will be called from client components with session
    return {};
  }

  async getConversations(token: string, limit = 20, offset = 0): Promise<ChatConversation[]> {
    const response = await axios.get(`${CHAT_API_URL}/chat/conversations`, {
      params: { limit, offset },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async createConversation(token: string, title?: string): Promise<ChatConversation> {
    const response = await axios.post(
      `${CHAT_API_URL}/chat/conversations`,
      { title },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getConversation(token: string, id: string): Promise<ChatConversation> {
    const response = await axios.get(`${CHAT_API_URL}/chat/conversations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async addMessage(
    token: string,
    conversationId: string,
    message: {
      role: "USER" | "ASSISTANT";
      content: string;
      bookContext?: string;
      metadata?: any;
    }
  ): Promise<ChatMessage> {
    const response = await axios.post(
      `${CHAT_API_URL}/chat/conversations/${conversationId}/messages`,
      message,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async updateConversation(
    token: string,
    id: string,
    updates: {
      title?: string;
      isPinned?: boolean;
      isActive?: boolean;
    }
  ): Promise<void> {
    await axios.patch(
      `${CHAT_API_URL}/chat/conversations/${id}`,
      updates,
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

  async deleteConversation(token: string, id: string): Promise<void> {
    await axios.delete(`${CHAT_API_URL}/chat/conversations/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}

export const chatService = new ChatService();
```

### 3.2 Update Chat Hook

**File**: `frontend/src/hooks/chat/useChatState.ts`

Update to integrate with the chat service:

```typescript
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { chatService, ChatConversation, ChatMessage } from "@/lib/chat-service";

export function useChatState(conversationId?: string) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount
  useEffect(() => {
    if (session?.accessToken) {
      loadConversations();
    }
  }, [session]);

  // Load specific conversation if ID provided
  useEffect(() => {
    if (conversationId && session?.accessToken) {
      loadConversation(conversationId);
    }
  }, [conversationId, session]);

  const loadConversations = async () => {
    if (!session?.accessToken) return;
    
    try {
      const convos = await chatService.getConversations(session.accessToken);
      setConversations(convos);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadConversation = async (id: string) => {
    if (!session?.accessToken) return;
    
    try {
      setIsLoading(true);
      const convo = await chatService.getConversation(session.accessToken, id);
      setCurrentConversation(convo);
      setMessages(convo.messages || []);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (title?: string) => {
    if (!session?.accessToken) return null;
    
    try {
      const convo = await chatService.createConversation(session.accessToken, title);
      setConversations(prev => [convo, ...prev]);
      setCurrentConversation(convo);
      setMessages([]);
      return convo;
    } catch (err) {
      console.error("Failed to create conversation:", err);
      return null;
    }
  };

  const sendMessage = async (content: string) => {
    if (!session?.accessToken || !content.trim()) return;

    // Create conversation if none exists
    let convoId = currentConversation?.id;
    if (!convoId) {
      const newConvo = await createNewConversation();
      if (!newConvo) return;
      convoId = newConvo.id;
    }

    try {
      setIsTyping(true);
      
      // Save user message
      const userMessage = await chatService.addMessage(
        session.accessToken,
        convoId,
        { role: "USER", content }
      );
      setMessages(prev => [...prev, userMessage]);

      // Call chatbot service (existing logic)
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content })
      });

      const data = await response.json();
      
      // Save assistant response
      const assistantMessage = await chatService.addMessage(
        session.accessToken,
        convoId,
        { role: "ASSISTANT", content: data.response }
      );
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
        await chatService.updateConversation(session.accessToken, convoId, { title });
      }
      
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message");
    } finally {
      setIsTyping(false);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!session?.accessToken) return;
    
    try {
      await chatService.deleteConversation(session.accessToken, id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  return {
    messages,
    conversations,
    currentConversation,
    inputMessage,
    isTyping,
    isLoading,
    error,
    actions: {
      setInputMessage,
      sendMessage,
      loadConversations,
      loadConversation,
      createNewConversation,
      deleteConversation,
      clearMessages: () => setMessages([])
    }
  };
}
```

### 3.3 Update Chat UI Component

**File**: `frontend/src/components/chat/ChatFeature.tsx`

Add conversation history sidebar and integrate with the updated hook.

---

## Phase 4: Testing & Validation

### 4.1 Backend Tests

Create test file: `services/user-service/src/__tests__/routes/chat.routes.test.ts`

Test cases:
- Create conversation
- List conversations
- Get conversation with messages
- Add messages
- Update conversation
- Delete conversation
- Authorization checks

### 4.2 Frontend Tests

Test the chat service and hooks:
- Message sending and storage
- Conversation switching
- History loading
- Error handling

---

## Phase 5: Additional Features (Optional)

### 5.1 Search Conversations
- Add full-text search on message content
- Filter by date range
- Filter by book context

### 5.2 Export Conversations
- Export as JSON
- Export as PDF
- Share conversation link

### 5.3 Analytics
- Track conversation metrics
- Most discussed books
- Average conversation length

---

## Implementation Timeline

**Week 1**: Phase 1 & 2 (Database + Backend API)
- Day 1-2: Schema design and migration
- Day 3-5: API routes implementation and testing

**Week 2**: Phase 3 (Frontend Integration)
- Day 1-2: Chat service implementation
- Day 3-4: Hook updates
- Day 5: UI updates

**Week 3**: Phase 4 & 5 (Testing + Polish)
- Day 1-3: Testing and bug fixes
- Day 4-5: Optional features and documentation

---

## Key Considerations

1. **Data Privacy**: Ensure chat data is properly isolated per user
2. **Performance**: Index frequently queried fields (userId, lastMessageAt)
3. **Storage**: Monitor database size as chat history grows
4. **Caching**: Consider caching recent conversations
5. **Cleanup**: Implement optional auto-deletion of old conversations
6. **Rate Limiting**: Prevent abuse of chat storage

---

## Migration Strategy

1. Deploy database changes first (backward compatible)
2. Deploy backend API (new routes, no breaking changes)
3. Deploy frontend updates (progressive enhancement)
4. Monitor for issues
5. Gradually enable for all users

---

## Success Metrics

- Users can create and manage multiple conversations
- Chat history persists across sessions
- No data loss or corruption
- Response time < 200ms for conversation loading
- 99.9% uptime for chat storage API
