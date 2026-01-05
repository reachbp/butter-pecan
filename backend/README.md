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

## Database Setup

### Initialize Database

1. Create the database schema:
```bash
npm run db:init
```

2. Seed with 20 Bay Area schools:
```bash
npm run db:seed
```

3. Or do both at once:
```bash
npm run db:reset && npm run db:seed
```

### Database Scripts

- `npm run db:init` - Initialize database with schema
- `npm run db:drop` - Drop all tables (⚠️ destructive)
- `npm run db:reset` - Reset database (drop and recreate)
- `npm run db:seed` - Seed schools data (20 Bay Area schools)
- `npm run db:seed:clear` - Clear all schools
- `npm run db:seed:reset` - Clear and reseed schools

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode

## API Endpoints

### Health Check
- `GET /health` - API health status

### Schools
- `GET /api/schools` - Get all schools
  - Query params: `?search=<term>`, `?city=<city>`, `?type=<type>`, `?grade=<grade>`
- `GET /api/schools/:id` - Get school by ID
- `GET /api/schools/stats/summary` - Get school statistics summary
- `POST /api/schools` - Create new school (admin only)
- `PUT /api/schools/:id` - Update school (admin only)
- `DELETE /api/schools/:id` - Soft delete school (admin only)

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
