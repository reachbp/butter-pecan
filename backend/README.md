# SchoolWatch Backend API

Backend API for SchoolWatch - Bay Area Private School Admissions Tracker

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Authentication**: JWT (planned)

## Project Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── middleware/      # Express middleware
│   ├── services/        # Service layer (Socket.io, etc.)
│   ├── config/          # Configuration files
│   └── utils/           # Utility functions
├── dist/                # Compiled JavaScript (gitignored)
└── index.ts             # Main entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking

## API Endpoints

### Health Check
- `GET /health` - API health status

### Schools
- `GET /api/schools` - Get all schools
- `GET /api/schools/:id` - Get school by ID
- `GET /api/schools/:id/stats` - Get school statistics

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Delete application

### Analytics
- `GET /api/analytics/overview` - Get aggregated analytics
- `GET /api/analytics/school/:id` - Get school-specific analytics
- `GET /api/analytics/timeline` - Get decision timeline

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Socket.io Events

### Client -> Server
- `subscribe:school` - Subscribe to school updates
- `unsubscribe:school` - Unsubscribe from school
- `application:update` - Report application update
- `decision:report` - Report decision received

### Server -> Client
- `application:updated` - Application status changed
- `decision:new` - New decision reported

## Development

The server runs on `http://localhost:3000` by default.
Socket.io connections are available on the same port.

## License

MIT
