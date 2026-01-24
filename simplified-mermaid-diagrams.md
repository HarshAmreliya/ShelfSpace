# ShelfSpace - Simplified Mermaid Diagrams for Project Review

## Figure 1: System Architecture (High-Level Overview)

```mermaid
graph TB
    subgraph "User Interface"
        USER[Web Browser<br/>Next.js + React]
    end

    subgraph "Gateway"
        GATEWAY[NGINX<br/>Entry Point]
    end

    subgraph "Core Services"
        AUTH[User Service<br/>Login & Profiles]
        BOOKS[Book Service<br/>Book Catalog]
        SOCIAL[Social Services<br/>Reviews, Groups, Chat]
        AI[AI Chatbot<br/>Recommendations]
    end

    subgraph "Data Storage"
        DB1[(PostgreSQL<br/>User Data)]
        DB2[(MongoDB<br/>Books)]
        DB3[(Redis<br/>Cache)]
    end

    USER --> GATEWAY
    GATEWAY --> AUTH
    GATEWAY --> BOOKS
    GATEWAY --> SOCIAL
    GATEWAY --> AI

    AUTH --> DB1
    BOOKS --> DB2
    SOCIAL --> DB1
    SOCIAL --> DB3
    AI --> DB2

    style USER fill:#e1f5ff
    style GATEWAY fill:#fff3e0
    style AUTH fill:#e8f5e9
    style BOOKS fill:#e8f5e9
    style SOCIAL fill:#e8f5e9
    style AI fill:#f3e5f5
    style DB1 fill:#fce4ec
    style DB2 fill:#fce4ec
    style DB3 fill:#fce4ec
```

**What this shows:** The complete system has 3 main layers:
- **User Interface**: What users see and interact with
- **Core Services**: Different parts handling specific functions (login, books, social features, AI)
- **Data Storage**: Where all information is saved

---

## Figure 2: Database Design (Simplified)

```mermaid
erDiagram
    USER ||--o{ LIBRARY : "manages"
    USER ||--o{ REVIEW : "writes"
    USER ||--o{ GROUP_MEMBER : "joins"
    USER ||--o{ MESSAGE : "sends"

    BOOK ||--o{ LIBRARY : "added to"
    BOOK ||--o{ REVIEW : "has"

    GROUP ||--o{ GROUP_MEMBER : "contains"
    GROUP ||--o{ MESSAGE : "has"

    USER {
        string email
        string name
        string profile_picture
    }

    BOOK {
        string title
        string author
        string description
        string cover_image
        float rating
    }

    LIBRARY {
        string status
        int progress
        date started
        date finished
    }

    REVIEW {
        int rating
        string text
        date created
    }

    GROUP {
        string name
        string description
        date created
    }

    GROUP_MEMBER {
        string role
        date joined
    }

    MESSAGE {
        string content
        date sent
    }
```

**What this shows:** How different data pieces connect:
- **Users** can manage their library, write reviews, join groups, and send messages
- **Books** can be in libraries and have reviews
- **Groups** have members and messages
- Simple relationships showing how everything links together

---

## Figure 3: User Journey Flow (Simplified)

```mermaid
sequenceDiagram
    actor User
    participant Website as ShelfSpace Website
    participant Services as Backend Services
    participant AI as AI Chatbot
    participant Database as Database

    Note over User,Database: 1. User Login
    User->>Website: Click "Login with Google"
    Website->>Services: Verify User
    Services->>Database: Get/Create Account
    Database-->>User: Successfully Logged In

    Note over User,Database: 2. Discover Books
    User->>Website: Search for "fantasy books"
    Website->>Services: Search Request
    Services->>Database: Find Matching Books
    Database-->>User: Display Book Results

    Note over User,Database: 3. Get AI Recommendations
    User->>Website: Chat: "Suggest similar books"
    Website->>AI: Process Request
    AI->>Database: Find Similar Books
    AI-->>User: Show Personalized Recommendations

    Note over User,Database: 4. Add to Library
    User->>Website: Add Book to Reading List
    Website->>Services: Update Library
    Services->>Database: Save to Library
    Database-->>User: Book Added Successfully

    Note over User,Database: 5. Write Review
    User->>Website: Submit 5-Star Review
    Website->>Services: Save Review
    Services->>Database: Store Review
    Database-->>User: Review Published

    Note over User,Database: 6. Join Reading Group
    User->>Website: Join "Sci-Fi Lovers" Group
    Website->>Services: Add to Group
    Services->>Database: Update Membership
    Database-->>User: Welcome to Group!
```

**What this shows:** The complete user experience from login to using all features:
1. **Login** - User signs in with Google
2. **Discover** - Search and browse books
3. **AI Help** - Get smart recommendations
4. **Organize** - Add books to personal library
5. **Share** - Write reviews
6. **Connect** - Join reading groups

---

## Figure 4: Frontend Structure (Simplified)

```mermaid
graph TB
    subgraph "Main Pages Users Visit"
        HOME[Home Page<br/>Landing & Featured Books]
        SEARCH[Book Discovery<br/>Search & Browse]
        LIBRARY[My Library<br/>Reading Lists]
        GROUPS[Reading Groups<br/>Community]
        CHAT[AI Chatbot<br/>Get Recommendations]
        PROFILE[My Profile<br/>Settings & Stats]
    end

    subgraph "Reusable Components"
        BOOK_CARD[Book Card<br/>Display Book Info]
        REVIEW[Review Component<br/>Ratings & Comments]
        CHAT_UI[Chat Interface<br/>Message Bubbles]
        FORM[Forms<br/>Submit Data]
    end

    subgraph "Behind the Scenes"
        AUTH_LOGIC[Login System<br/>User Sessions]
        API_CALLS[API Communication<br/>Talk to Backend]
        REAL_TIME[Live Updates<br/>Instant Notifications]
    end

    HOME --> BOOK_CARD
    SEARCH --> BOOK_CARD
    SEARCH --> FORM

    LIBRARY --> BOOK_CARD
    LIBRARY --> REVIEW

    GROUPS --> CHAT_UI
    GROUPS --> FORM

    CHAT --> CHAT_UI

    PROFILE --> FORM
    PROFILE --> AUTH_LOGIC

    BOOK_CARD --> API_CALLS
    REVIEW --> API_CALLS
    CHAT_UI --> REAL_TIME
    FORM --> API_CALLS
    AUTH_LOGIC --> API_CALLS

    style HOME fill:#e3f2fd
    style SEARCH fill:#e3f2fd
    style LIBRARY fill:#e3f2fd
    style GROUPS fill:#e3f2fd
    style CHAT fill:#e3f2fd
    style PROFILE fill:#e3f2fd

    style BOOK_CARD fill:#e8f5e9
    style REVIEW fill:#e8f5e9
    style CHAT_UI fill:#e8f5e9
    style FORM fill:#e8f5e9

    style AUTH_LOGIC fill:#fff3e0
    style API_CALLS fill:#fff3e0
    style REAL_TIME fill:#fff3e0
```

**What this shows:** How the website is organized:
- **Main Pages**: Different sections users can visit (Home, Search, Library, Groups, Chat, Profile)
- **Reusable Components**: Building blocks used across multiple pages (Book Cards, Reviews, Chat UI, Forms)
- **Behind the Scenes**: Technical systems that make everything work (Login, API calls, Real-time updates)

---

## How to Use These Simplified Diagrams

### Quick Steps:
1. **Go to:** https://mermaid.live/
2. **Copy** one diagram code from above
3. **Paste** into the editor
4. **Download** as PNG image
5. **Insert** into your Word document

### What Makes These Better for Reviews:
✅ **Simple language** - No technical jargon
✅ **Clear labels** - Easy to understand names
✅ **High-level view** - Shows the big picture
✅ **Visual clarity** - Color-coded and organized
✅ **Focused** - Only important features

### For Your Presentation:
- **Figure 1**: Show the overall system structure
- **Figure 2**: Explain how data is connected
- **Figure 3**: Demonstrate user experience flow
- **Figure 4**: Display website organization

---

## Key Points for Your Reviewers:

### Figure 1 - System Architecture
**"Our project has 3 main parts:**
1. A beautiful website users interact with
2. Powerful services in the background doing different jobs
3. Smart databases storing all the information"

### Figure 2 - Database Design
**"We store 7 main types of information:**
- Users and their profiles
- Books with details
- Personal libraries
- Reviews and ratings
- Reading groups
- Group members
- Chat messages"

### Figure 3 - User Journey
**"A typical user can:**
1. Login easily with Google
2. Search for books
3. Get AI-powered recommendations
4. Organize their reading
5. Share reviews
6. Join communities"

### Figure 4 - Frontend Structure
**"Our website has:**
- 6 main pages users visit
- Reusable components that work everywhere
- Smart systems handling login, data, and live updates"

---

## Size Recommendations for Document:

| Diagram | Size | Description |
|---------|------|-------------|
| Figure 1 | Full page width | Shows complete system |
| Figure 2 | Full page width | Database relationships |
| Figure 3 | Full page width (or landscape) | User journey steps |
| Figure 4 | Full page width | Website structure |

All diagrams are now **reviewer-friendly** and focus on **what the system does** rather than **how it works technically**! 🎯
