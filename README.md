# ShelfSpace - Book Management Platform

A comprehensive book management platform with multiple microservices, featuring book discovery, reviews, reading groups, and AI-powered chat assistance.

## 🌟 Overview

ShelfSpace is a full-featured book management platform that helps readers discover, organize, and discuss books. Built with a microservices architecture, it provides book recommendations, review management, reading groups, and an AI-powered chat assistant.

## ✨ Features

- 📚 **Book Discovery** - Discover new books with intelligent recommendations
- ⭐ **Reviews & Ratings** - Write and read book reviews
- 👥 **Reading Groups** - Join or create reading groups
- 🤖 **AI Chat Assistant** - Get book recommendations and insights
- 📖 **Personal Library** - Organize your reading list
- 📊 **Reading Analytics** - Track your reading progress
- 🔐 **Authentication** - Secure user authentication with NextAuth
- 💬 **Real-Time Chat** - Socket.io powered real-time communication
- 🎨 **Modern UI** - Beautiful, responsive design

## 🏗️ Architecture

ShelfSpace follows a microservices architecture:

### Services

- **Book Service** - Book catalog and metadata management
- **Review Service** - Reviews and ratings
- **User Service** - User management
- **User Library Service** - Personal library management
- **Chat Service** - Real-time messaging
- **Admin Service** - Administrative functions
- **Group Service** - Reading groups management

### Frontend

- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Next Auth** - Authentication
- **Socket.io** - Real-time communication
- **Recharts** - Data visualization

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.3.4](https://nextjs.org/)** - React framework
- **[React 19](https://reactjs.org/)** - UI library
- **[TypeScript 5.9.2](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 3.4.3](https://tailwindcss.com/)** - Styling
- **[Next Auth](https://next-auth.js.org/)** - Authentication
- **[Socket.io Client](https://socket.io/)** - Real-time communication
- **[Recharts](https://recharts.org/)** - Data visualization

### Backend Services
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching
- **Docker** - Containerization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL database
- Redis (optional, for caching)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ShelfSpace
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start services with Docker**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   cd services/user-service
   npx prisma migrate dev
   ```

6. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

## 📝 Available Scripts

### Root Level
- `npm run docker:up` - Start Docker services
- `npm run docker:down` - Stop Docker services

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests

## 📁 Project Structure

```
ShelfSpace/
├── frontend/              # Next.js frontend
│   └── src/
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       ├── hooks/        # Custom hooks
│       └── services/     # API services
├── services/             # Microservices
│   ├── book-service/
│   ├── review-service/
│   ├── user-service/
│   ├── chat-service/
│   └── ...
├── docker-compose.yml    # Docker configuration
└── scripts/             # Utility scripts
```

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [API Documentation](./docs/api/README.md)
- [Design System](./frontend/DESIGN_SYSTEM.md)
- [Testing Guide](./TESTING.md)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please see the contributing guidelines for details.

---

Made with ❤️ for book lovers everywhere

