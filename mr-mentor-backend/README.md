# Express TypeScript Template

A modern Express.js TypeScript template with TypeORM, PostgreSQL, and REST API endpoints, organized with controllers, routes, and services in class-based architecture.

## Features

- ✅ Express.js with TypeScript
- ✅ TypeORM with PostgreSQL integration
- ✅ Class-based architecture (Controllers, Routes, Services)
- ✅ Health check endpoint (`/api/health`)
- ✅ User CRUD operations
- ✅ Database connection health monitoring
- ✅ Error handling middleware
- ✅ Security middleware (Helmet, CORS)
- ✅ Logging (Morgan)
- ✅ ESLint configuration
- ✅ Development and production builds

## Project Structure

```
src/
├── config/              # Configuration files
│   └── database.ts      # Database configuration
├── controllers/         # Request handlers (class-based)
│   ├── health.controller.ts
│   └── user.controller.ts
├── entities/           # TypeORM entities
│   └── User.ts
├── routes/             # Route definitions (class-based)
│   ├── health.routes.ts
│   ├── user.routes.ts
│   └── index.ts
├── services/           # Business logic (class-based)
│   ├── health.service.ts
│   └── user.service.ts
├── types/              # TypeScript type definitions
│   └── health.types.ts
├── app.ts             # Express app configuration
└── index.ts           # Application entry point
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database running on localhost:5432
- Database credentials: username=shubham, password=shubham, database=shubham

## Installation

1. Install dependencies:

```bash
npm install
```

2. Set up your PostgreSQL database with the following credentials:

   - Host: localhost
   - Port: 5432
   - Username: shubham
   - Password: shubham
   - Database: shubham

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Create database tables:

```bash
npm run db:create
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:create` - Create database tables
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## API Endpoints

### Health Check

- **GET** `/api/health` - Returns application health status including database connection

Example response:

```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2025-06-26T10:30:00.000Z",
    "uptime": 123.456,
    "environment": "development",
    "database": {
      "connected": true,
      "type": "postgresql"
    }
  }
}
```

### User Management

- **GET** `/api/users` - Get all active users
- **GET** `/api/users/:id` - Get user by ID
- **GET** `/api/users/stats` - Get user statistics
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Soft delete user

#### Create User Example:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "age": 30
}
```

## Development

Start the development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production

Build and start the production server:

```bash
npm run build
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username (default: shubham)
- `DB_PASSWORD` - Database password (default: shubham)
- `DB_NAME` - Database name (default: shubham)

## Architecture

This template follows a class-based architecture with TypeORM integration:

- **Controllers**: Handle HTTP requests and responses
- **Routes**: Define API endpoints and connect them to controllers
- **Services**: Contain business logic and data processing
- **Entities**: TypeORM database entities (User model)
- **Config**: Database and application configuration
- **Types**: TypeScript interfaces and type definitions
