# Restaurant Food API

A backend API for a restaurant food delivery application built with [NestJS](https://github.com/nestjs/nest), TypeScript, and Prisma ORM.

## Local Setup Instructions

Follow these steps to get the project up and running on your local machine.

### 1. Prerequisites
- **Node.js**: Make sure you have Node.js installed (v18 or higher is recommended).
- **PostgreSQL**: Required for the primary database.
- **Redis**: Required if you plan to enable caching or throttling mechanisms.

### 2. Install dependencies
Clone the repository and install the required NPM packages:

```bash
npm install
```

### 3. Environment Variables
Ensure you have a `.env` file in the root directory. You can configure your environment variables based on the following structure:

```env
# core
PORT=5000
NODE_ENV="development"
BACKEND_URL="http://localhost:5000"

# DB
DATABASE_URL="postgresql://user:password@localhost:5432/your_database"
DB_LOGGING_ENABLED=true

# auth
JWT_SECRET="your_jwt_secret_key"
JWT_REFRESH_TOKEN_EXPIRES=30d
JWT_ACCESS_TOKEN_EXPIRES=10m

# caching & redis
REDIS_HOST="127.0.0.1" 
REDIS_PORT=6379
```

### 4. Database Setup (Prisma)
Before running the application, you need to set up the database schema using Prisma.

```bash
# 1. Generate the Prisma Client
npx prisma generate

# 2. Run migrations to update the database schema
npx prisma migrate dev

# 3. (Optional) Seed the database with initial data
npx prisma db seed
```

### 5. Running the Application
Start the NestJS application. You can run it in different modes depending on your needs:

```bash
# Development mode (Recommended for local dev - watches for file changes)
npm run start:dev

# Standard run (Executes migrations, seeding, and then starts)
npm run start

# Production mode
npm run start:prod
```

### 6. Accessing the Server
Once started, the server should be running locally. By default, it will be mapped to the port defined in your `.env` file:
- **API Base URL**: `http://localhost:5000`
