# Books Content Management System

A simple Books CMS built with NestJS, GraphQL, PostgreSQL, Redis, and DynamoDB.

## Features

- CRUD operations for books
- Search with filters
- Sorting and pagination
- JWT auth
- Role-based access
- Rate limiting
- Redis caching
- DynamoDB logging

## Tech Stack

- NestJS
- GraphQL
- PostgreSQL
- Redis
- DynamoDB
- TypeORM
- JWT

## Prerequisites

- Node.js 22 LTS
- PostgreSQL 16
- Redis 7
- DynamoDB Local
- AWS Account (for production)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd books-cms
```

2. Install dependencies:
```bash
yarn install
```

3. Set up your environment:
```bash
cp .env.example .env
```

4. Start local services:
- PostgreSQL (port 5432)
- Redis (port 6379) 
- DynamoDB Local (port 8000)

5. Run database migrations:
```bash
yarn migration:run
```

6. Start the app:
```bash
# Development
yarn start:dev

# Production
yarn build
yarn start:prod
```

## Environment Variables

Check `.env.example` for required variables:
- Database settings
- Redis config
- AWS credentials
- JWT secret

## Testing

```bash
# Unit tests
yarn test
```

## API Documentation

Import the Postman collection (`books-cms.postman_collection.json`) to test:
- Auth endpoints
- Book management
- GraphQL queries/mutations

## Database Management

```bash
# Create migration
yarn migration:generate src/migrations/MigrationName

# Run migrations
yarn migration:run

# Revert last migration
yarn migration:revert
```

## Security

- JWT auth
- Role-based access
- Rate limiting
- Input validation

## Caching

Redis handles:
- Query caching
- Rate limiting

## Logging

DynamoDB stores:
- User activity
- System events
- Book changes

## License

MIT
