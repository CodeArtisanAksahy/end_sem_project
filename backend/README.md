# Production Ready Backend

A scalable, reliable backend API built with Express, TypeScript, MongoDB, and Redis.

## Features
- **MVC Architecture** with strict layer separation
- **JWT & Refresh Tokens** + OTP stub logic
- **Zod Validation**, Global Error Handlers, Winston Logging
- **Docker Ready** (Dockerfile + Compose)

## Setup
1. `npm install`
2. Setup `.env` from `.env.example`
3. Run `docker-compose up -d` (for mongo & redis)
4. `npm run dev`

## API
- `POST /api/v1/auth/register` -> Create User
- `POST /api/v1/auth/login` -> Get JWT 
- `GET /health` -> API check
