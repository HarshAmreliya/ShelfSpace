# ShelfSpace Capstone Project - Mermaid Diagrams

## Figure 1: System Architecture

```mermaid
graph TB
    subgraph "Presentation Layer"
        UI[Next.js Frontend<br/>React 19 + TypeScript]
        SSR[Server-Side Rendering]
        CSR[Client-Side Rendering]
        WS_CLIENT[Socket.io Client]
    end

    subgraph "API Gateway Layer"
        NGINX[NGINX API Gateway<br/>Load Balancer<br/>SSL Termination]
    end

    subgraph "Service Layer - Microservices"
        direction TB
        US[User Service<br/>Port 3001<br/>Authentication & Profiles]
        BS[Book Service<br/>Port 3004<br/>Book Catalog]
        RS[Review Service<br/>Port 3002<br/>Ratings & Reviews]
        LS[User Library Service<br/>Port 3003<br/>Personal Libraries]
        GS[Group Service<br/>Port 3005<br/>Reading Groups]
        CS[Chat Service<br/>Port 3006<br/>Real-time Messaging]
        AS[Admin Service<br/>Port 3007<br/>Admin Operations]
        CBS[Chatbot Service<br/>Port 8000<br/>AI Recommendations<br/>Python/FastAPI]
    end

    subgraph "Data Layer"
        direction LR
        PG[(PostgreSQL<br/>Relational Data<br/>Users, Reviews<br/>Groups, Chat)]
        MG[(MongoDB<br/>Document Store<br/>Book Catalog<br/>Metadata)]
        RD[(Redis<br/>Cache & Sessions<br/>Pub/Sub<br/>Real-time Data)]
    end

    subgraph "AI/ML Layer"
        PC[Pinecone<br/>Vector Database<br/>Semantic Search]
        NLP[NLP Engine<br/>Query Understanding]
        EMB[Embedding Models<br/>Text Vectorization]
    end

    subgraph "External Services"
        OAUTH[OAuth Providers<br/>Google, GitHub]
        EMAIL[Email Service<br/>SMTP]
        STORAGE[Cloud Storage<br/>Images, Files]
    end

    %% Connections
    UI --> NGINX
    SSR --> NGINX
    CSR --> NGINX
    WS_CLIENT -.WebSocket.-> CS

    NGINX --> US
    NGINX --> BS
    NGINX --> RS
    NGINX --> LS
    NGINX --> GS
    NGINX --> CS
    NGINX --> AS
    NGINX --> CBS

    US --> PG
    US --> RD
    RS --> PG
    LS --> PG
    GS --> PG
    CS --> PG
    CS --> RD
    AS --> PG
    BS --> MG

    CBS --> PC
    CBS --> NLP
    CBS --> EMB

    US --> OAUTH
    US --> EMAIL
    UI --> STORAGE

    %% Inter-service communication
    RS -.API Call.-> US
    LS -.API Call.-> US
    LS -.API Call.-> BS
    GS -.API Call.-> US
    CS -.API Call.-> US
    CS -.API Call.-> GS
    AS -.API Call.-> US

    style UI fill:#e1f5ff
    style NGINX fill:#fff3e0
    style US fill:#e8f5e9
    style BS fill:#e8f5e9
    style RS fill:#e8f5e9
    style LS fill:#e8f5e9
    style GS fill:#e8f5e9
    style CS fill:#e8f5e9
    style AS fill:#e8f5e9
    style CBS fill:#f3e5f5
    style PG fill:#fce4ec
    style MG fill:#fce4ec
    style RD fill:#fce4ec
    style PC fill:#fff9c4
    style NLP fill:#fff9c4
    style EMB fill:#fff9c4
```

---

## Figure 2: Database Design

```mermaid
erDiagram
    %% PostgreSQL Tables
    USER ||--o{ USER_LIBRARY : owns
    USER ||--o{ REVIEW : writes
    USER ||--o{ GROUP_MEMBER : joins
    USER ||--o{ CHAT_MESSAGE : sends
    USER ||--|| PREFERENCES : has
    USER ||--|| USER_STATS : has
    USER ||--o{ USER_BADGE : earns
    USER ||--o{ USER_GOAL : sets

    USER {
        uuid id PK
        string email UK
        string name
        string avatarUrl
        string bio
        string website
        boolean isPublic
        timestamp createdAt
        timestamp updatedAt
        enum status
    }

    PREFERENCES {
        int id PK
        uuid userId FK
        enum theme
        string language
        string timezone
        boolean notificationsEmail
        boolean notificationsSMS
        boolean newsletterOptIn
        boolean dailyDigest
        enum defaultSortOrder
    }

    USER_STATS {
        int id PK
        uuid userId FK
        int booksRead
        int reviewsWritten
        int pagesRead
        decimal avgRating
        int readingStreak
        timestamp lastActive
    }

    USER_BADGE {
        int id PK
        uuid userId FK
        string badgeType
        timestamp earnedAt
    }

    USER_GOAL {
        int id PK
        uuid userId FK
        int targetBooks
        int year
        int currentProgress
    }

    USER_LIBRARY {
        uuid id PK
        uuid userId FK
        string bookId FK
        enum status
        int progress
        timestamp startedAt
        timestamp finishedAt
        int rating
        timestamp addedAt
    }

    REVIEW {
        uuid id PK
        uuid userId FK
        string bookId FK
        int rating
        text content
        int helpfulCount
        boolean isVerified
        timestamp createdAt
        timestamp updatedAt
    }

    READING_GROUP {
        uuid id PK
        string name
        text description
        boolean isPublic
        int memberLimit
        uuid creatorId FK
        timestamp createdAt
    }

    GROUP_MEMBER {
        uuid id PK
        uuid groupId FK
        uuid userId FK
        enum role
        timestamp joinedAt
    }

    CHAT_ROOM {
        uuid id PK
        uuid groupId FK
        string name
        timestamp createdAt
    }

    CHAT_MESSAGE {
        uuid id PK
        uuid roomId FK
        uuid senderId FK
        text content
        boolean isEdited
        timestamp createdAt
        timestamp updatedAt
    }

    ADMIN_LOG {
        uuid id PK
        uuid adminId FK
        string action
        json metadata
        timestamp createdAt
    }

    %% MongoDB Collections
    BOOK {
        objectId _id PK
        string isbn UK
        string title
        array authors
        string description
        array genres
        string publisher
        date publicationDate
        string coverImage
        int pageCount
        string language
        decimal avgRating
        int reviewCount
        array tags
        object metadata
    }

    %% Redis Data Structures
    SESSION {
        string key PK
        json userData
        timestamp expiry
    }

    CACHE {
        string key PK
        json data
        int ttl
    }

    PUBSUB_CHANNEL {
        string channel
        json message
    }

    READING_GROUP ||--o{ GROUP_MEMBER : contains
    READING_GROUP ||--|| CHAT_ROOM : has
    CHAT_ROOM ||--o{ CHAT_MESSAGE : contains
    USER ||--o{ ADMIN_LOG : performs

    %% Cross-database relationships (represented as FK references)
    USER_LIBRARY }o--|| BOOK : references
    REVIEW }o--|| BOOK : about
```

---

## Figure 3: Service Interaction Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Frontend
    participant Gateway as NGINX Gateway
    participant UserSvc as User Service
    participant BookSvc as Book Service
    participant ChatbotSvc as Chatbot Service
    participant LibrarySvc as Library Service
    participant ReviewSvc as Review Service
    participant ChatSvc as Chat Service
    participant GroupSvc as Group Service
    participant PostgreSQL
    participant MongoDB
    participant Redis
    participant Pinecone

    %% Authentication Flow
    rect rgb(230, 245, 255)
        Note over User,UserSvc: User Authentication Flow
        User->>Frontend: Click "Login with Google"
        Frontend->>Gateway: OAuth Request
        Gateway->>UserSvc: Forward OAuth Request
        UserSvc->>UserSvc: Validate OAuth Token
        UserSvc->>PostgreSQL: Check/Create User
        PostgreSQL-->>UserSvc: User Data
        UserSvc->>Redis: Store Session
        UserSvc->>UserSvc: Generate JWT
        UserSvc-->>Gateway: JWT Token
        Gateway-->>Frontend: Auth Response + Token
        Frontend-->>User: Logged In
    end

    %% Book Discovery Flow
    rect rgb(245, 255, 230)
        Note over User,MongoDB: Book Discovery & Search Flow
        User->>Frontend: Search "fantasy adventure"
        Frontend->>Gateway: GET /api/books/search
        Gateway->>BookSvc: Forward Search Request + JWT
        BookSvc->>BookSvc: Validate JWT
        BookSvc->>MongoDB: Query Books Collection
        MongoDB-->>BookSvc: Matching Books
        BookSvc->>Redis: Cache Results
        BookSvc-->>Gateway: Book List
        Gateway-->>Frontend: Search Results
        Frontend-->>User: Display Books
    end

    %% AI Recommendation Flow
    rect rgb(255, 245, 230)
        Note over User,Pinecone: AI Chatbot Recommendation Flow
        User->>Frontend: Chat: "Recommend melancholic books"
        Frontend->>Gateway: POST /api/chatbot/query
        Gateway->>ChatbotSvc: Forward Query + JWT
        ChatbotSvc->>UserSvc: Validate User
        UserSvc-->>ChatbotSvc: User Valid
        ChatbotSvc->>ChatbotSvc: Process NLP Query
        ChatbotSvc->>Pinecone: Semantic Search (Vector)
        Pinecone-->>ChatbotSvc: Similar Books (Vectors)
        ChatbotSvc->>LibrarySvc: Get User Reading History
        LibrarySvc->>PostgreSQL: Query User Library
        PostgreSQL-->>LibrarySvc: Reading History
        LibrarySvc-->>ChatbotSvc: User History
        ChatbotSvc->>ChatbotSvc: Rank & Filter Results
        ChatbotSvc-->>Gateway: Recommendations + Explanation
        Gateway-->>Frontend: AI Response
        Frontend-->>User: Display Recommendations
    end

    %% Review Submission Flow
    rect rgb(255, 230, 245)
        Note over User,PostgreSQL: Review Submission Flow
        User->>Frontend: Submit Review (5 stars + text)
        Frontend->>Gateway: POST /api/reviews
        Gateway->>ReviewSvc: Create Review + JWT
        ReviewSvc->>UserSvc: Validate User
        UserSvc-->>ReviewSvc: User Valid
        ReviewSvc->>PostgreSQL: Insert Review
        PostgreSQL-->>ReviewSvc: Review Created
        ReviewSvc->>ReviewSvc: Calculate Aggregate Rating
        ReviewSvc->>BookSvc: Update Book Rating
        BookSvc->>MongoDB: Update avgRating
        MongoDB-->>BookSvc: Updated
        BookSvc-->>ReviewSvc: Success
        ReviewSvc-->>Gateway: Review Saved
        Gateway-->>Frontend: Success Response
        Frontend-->>User: Review Published
    end

    %% Reading Group Flow
    rect rgb(245, 230, 255)
        Note over User,Redis: Reading Group & Chat Flow
        User->>Frontend: Join Reading Group
        Frontend->>Gateway: POST /api/groups/join
        Gateway->>GroupSvc: Join Request + JWT
        GroupSvc->>UserSvc: Validate User
        UserSvc-->>GroupSvc: User Valid
        GroupSvc->>PostgreSQL: Add Group Member
        PostgreSQL-->>GroupSvc: Member Added
        GroupSvc->>ChatSvc: Notify Group Chat
        ChatSvc->>Redis: Publish to Group Channel
        Redis-->>ChatSvc: Published
        ChatSvc->>PostgreSQL: Store Join Message
        ChatSvc-->>GroupSvc: Notification Sent
        GroupSvc-->>Gateway: Joined Successfully
        Gateway-->>Frontend: Success + Group Details
        Frontend-->>User: Joined Group

        Note over User,Redis: Real-time Chat Message
        User->>Frontend: Send Chat Message
        Frontend->>ChatSvc: WebSocket: Send Message
        ChatSvc->>PostgreSQL: Store Message
        ChatSvc->>Redis: Publish to Room
        Redis-->>ChatSvc: Published
        ChatSvc-->>Frontend: Broadcast to All Clients
        Frontend-->>User: Message Delivered
    end

    %% Library Update Flow
    rect rgb(230, 255, 245)
        Note over User,PostgreSQL: Personal Library Update Flow
        User->>Frontend: Mark Book as "Currently Reading"
        Frontend->>Gateway: POST /api/library/update
        Gateway->>LibrarySvc: Update Library + JWT
        LibrarySvc->>UserSvc: Validate User
        UserSvc-->>LibrarySvc: User Valid
        LibrarySvc->>PostgreSQL: Update User_Library
        PostgreSQL-->>LibrarySvc: Updated
        LibrarySvc->>LibrarySvc: Recalculate Stats
        LibrarySvc->>PostgreSQL: Update User_Stats
        PostgreSQL-->>LibrarySvc: Stats Updated
        LibrarySvc-->>Gateway: Library Updated
        Gateway-->>Frontend: Success
        Frontend-->>User: Library Updated
    end
```

---

## Figure 4: Frontend Architecture

```mermaid
graph TB
    subgraph "Next.js Application Structure"
        direction TB

        subgraph "App Router (src/app/)"
            HOME[/home<br/>Landing Page]
            AUTH[/auth<br/>Login/Register]
            BOOKS[/books<br/>Book Discovery]
            BOOK_DETAIL[/books/id<br/>Book Details]
            LIBRARY[/library<br/>My Library]
            GROUPS[/groups<br/>Reading Groups]
            GROUP_DETAIL[/groups/id<br/>Group Page]
            PROFILE[/profile<br/>User Profile]
            CHAT[/chat<br/>Messaging]
            ADMIN[/admin<br/>Admin Dashboard]
        end

        subgraph "Components (src/components/)"
            direction TB

            subgraph "Layout Components"
                HEADER[Header<br/>Navigation & Auth]
                FOOTER[Footer<br/>Links & Info]
                SIDEBAR[Sidebar<br/>Filters & Menu]
            end

            subgraph "Feature Components"
                BOOK_CARD[BookCard<br/>Book Display]
                REVIEW_CARD[ReviewCard<br/>Review Display]
                CHAT_BOT[ChatBot<br/>AI Assistant]
                CHAT_MESSAGE[ChatMessage<br/>Message Bubble]
                GROUP_CARD[GroupCard<br/>Group Display]
                LIBRARY_SHELF[LibraryShelf<br/>Book Organization]
                RATING[RatingStars<br/>Star Rating]
                SEARCH[SearchBar<br/>Search Input]
            end

            subgraph "Form Components"
                REVIEW_FORM[ReviewForm<br/>Submit Review]
                GROUP_FORM[GroupForm<br/>Create Group]
                PROFILE_FORM[ProfileForm<br/>Edit Profile]
                CHAT_INPUT[ChatInput<br/>Message Input]
            end

            subgraph "UI Components"
                BUTTON[Button<br/>Styled Buttons]
                MODAL[Modal<br/>Dialogs]
                LOADING[Loading<br/>Spinners]
                TOAST[Toast<br/>Notifications]
                CARD[Card<br/>Container]
                BADGE[Badge<br/>Labels]
            end
        end

        subgraph "Hooks (src/hooks/)"
            USE_AUTH[useAuth<br/>Auth State]
            USE_BOOKS[useBooks<br/>Book Data]
            USE_REVIEWS[useReviews<br/>Review Data]
            USE_CHAT[useChat<br/>Chat State]
            USE_LIBRARY[useLibrary<br/>Library State]
            USE_SOCKET[useSocket<br/>WebSocket]
        end

        subgraph "Services (src/services/)"
            AUTH_SVC[authService<br/>Authentication API]
            BOOK_SVC[bookService<br/>Book API]
            REVIEW_SVC[reviewService<br/>Review API]
            LIBRARY_SVC[libraryService<br/>Library API]
            GROUP_SVC[groupService<br/>Group API]
            CHAT_SVC[chatService<br/>Chat API]
            CHATBOT_SVC[chatbotService<br/>AI API]
            ADMIN_SVC[adminService<br/>Admin API]
        end

        subgraph "Context Providers (src/context/)"
            AUTH_CTX[AuthContext<br/>User Session]
            THEME_CTX[ThemeContext<br/>UI Theme]
            SOCKET_CTX[SocketContext<br/>WebSocket Conn]
            NOTIF_CTX[NotificationContext<br/>Alerts]
        end

        subgraph "Utilities (src/lib/)"
            AXIOS[Axios Config<br/>HTTP Client]
            SOCKET_IO[Socket.io Client<br/>WebSocket]
            VALIDATORS[Validators<br/>Form Validation]
            FORMATTERS[Formatters<br/>Data Format]
            CONSTANTS[Constants<br/>Config Values]
        end

        subgraph "Styling (src/styles/)"
            GLOBALS[globals.css<br/>Global Styles]
            TAILWIND[tailwind.config.js<br/>Tailwind Setup]
            THEME[theme.ts<br/>Design Tokens]
        end

        subgraph "Configuration"
            NEXT_CONFIG[next.config.js<br/>Next.js Config]
            TS_CONFIG[tsconfig.json<br/>TypeScript Config]
            ENV[.env.local<br/>Environment Vars]
            PACKAGE[package.json<br/>Dependencies]
        end
    end

    subgraph "External Integrations"
        NEXTAUTH[NextAuth.js<br/>OAuth Provider]
        SOCKETIO_SERVER[Socket.io Server<br/>Chat Service]
        API_GATEWAY[NGINX Gateway<br/>Backend APIs]
    end

    %% Page to Component Connections
    HOME --> HEADER
    HOME --> BOOK_CARD
    HOME --> SEARCH
    HOME --> FOOTER

    BOOKS --> HEADER
    BOOKS --> SIDEBAR
    BOOKS --> BOOK_CARD
    BOOKS --> SEARCH

    BOOK_DETAIL --> HEADER
    BOOK_DETAIL --> REVIEW_CARD
    BOOK_DETAIL --> REVIEW_FORM
    BOOK_DETAIL --> RATING

    LIBRARY --> HEADER
    LIBRARY --> LIBRARY_SHELF
    LIBRARY --> BOOK_CARD

    GROUPS --> HEADER
    GROUPS --> GROUP_CARD
    GROUPS --> GROUP_FORM

    GROUP_DETAIL --> HEADER
    GROUP_DETAIL --> CHAT_MESSAGE
    GROUP_DETAIL --> CHAT_INPUT

    CHAT --> HEADER
    CHAT --> CHAT_BOT
    CHAT --> CHAT_MESSAGE
    CHAT --> CHAT_INPUT

    PROFILE --> HEADER
    PROFILE --> PROFILE_FORM

    %% Component to Hook Connections
    HEADER --> USE_AUTH
    BOOK_CARD --> USE_LIBRARY
    REVIEW_FORM --> USE_REVIEWS
    CHAT_BOT --> USE_CHAT
    CHAT_MESSAGE --> USE_SOCKET
    LIBRARY_SHELF --> USE_LIBRARY
    SEARCH --> USE_BOOKS

    %% Hook to Service Connections
    USE_AUTH --> AUTH_SVC
    USE_BOOKS --> BOOK_SVC
    USE_REVIEWS --> REVIEW_SVC
    USE_LIBRARY --> LIBRARY_SVC
    USE_CHAT --> CHAT_SVC
    USE_CHAT --> CHATBOT_SVC
    USE_SOCKET --> CHAT_SVC

    %% Service to External Connections
    AUTH_SVC --> AXIOS
    AUTH_SVC --> NEXTAUTH
    BOOK_SVC --> AXIOS
    REVIEW_SVC --> AXIOS
    LIBRARY_SVC --> AXIOS
    GROUP_SVC --> AXIOS
    CHAT_SVC --> SOCKET_IO
    CHATBOT_SVC --> AXIOS
    ADMIN_SVC --> AXIOS

    AXIOS --> API_GATEWAY
    SOCKET_IO --> SOCKETIO_SERVER

    %% Context Usage
    AUTH_CTX --> USE_AUTH
    SOCKET_CTX --> USE_SOCKET
    THEME_CTX --> GLOBALS
    NOTIF_CTX --> TOAST

    %% Styling
    TAILWIND --> GLOBALS
    THEME --> TAILWIND

    %% Configuration
    NEXT_CONFIG --> ENV
    TS_CONFIG --> PACKAGE

    style HOME fill:#e3f2fd
    style BOOKS fill:#e3f2fd
    style BOOK_DETAIL fill:#e3f2fd
    style LIBRARY fill:#e3f2fd
    style GROUPS fill:#e3f2fd
    style GROUP_DETAIL fill:#e3f2fd
    style CHAT fill:#e3f2fd
    style PROFILE fill:#e3f2fd

    style HEADER fill:#f3e5f5
    style FOOTER fill:#f3e5f5
    style SIDEBAR fill:#f3e5f5

    style BOOK_CARD fill:#e8f5e9
    style REVIEW_CARD fill:#e8f5e9
    style CHAT_BOT fill:#e8f5e9
    style GROUP_CARD fill:#e8f5e9

    style USE_AUTH fill:#fff3e0
    style USE_BOOKS fill:#fff3e0
    style USE_CHAT fill:#fff3e0

    style AUTH_SVC fill:#fce4ec
    style BOOK_SVC fill:#fce4ec
    style CHAT_SVC fill:#fce4ec
```

---

## How to Use These Diagrams

### Option 1: Mermaid Live Editor (Online)
1. Go to https://mermaid.live/
2. Copy one of the diagram codes above
3. Paste it into the editor
4. The diagram will render automatically
5. Click "Actions" → "Download PNG" or "Download SVG"

### Option 2: VS Code Extension
1. Install "Markdown Preview Mermaid Support" extension
2. Create a new `.md` file
3. Paste the diagram code inside triple backticks with `mermaid` language identifier
4. Preview the file (Ctrl+Shift+V)
5. Right-click → Export to PNG/SVG

### Option 3: Insert into Word Document
1. Render the diagram using Mermaid Live Editor
2. Download as PNG or SVG (PNG recommended for Word)
3. Open your capstone.doc file
4. Insert → Picture → Select downloaded image
5. Add figure caption below

### Diagram Sizes Recommendation
- **Figure 1 (System Architecture)**: Large - Full page width
- **Figure 2 (Database Design)**: Large - Full page width
- **Figure 3 (Service Interaction)**: Extra Large - May need landscape orientation
- **Figure 4 (Frontend Architecture)**: Large - Full page width

---

## Notes
- All diagrams are designed to match the content in your capstone document
- Colors are used to differentiate layers/components
- Diagrams follow standard architectural diagram conventions
- All service ports and technologies match your actual implementation
- Database relationships and inter-service communications are accurately depicted
