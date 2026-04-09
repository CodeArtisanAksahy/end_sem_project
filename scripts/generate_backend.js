const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.env.HOME || '/Users/akshaythakur', 'Downloads', 'backend');

const files = {
  'package.json': `{
  "name": "production-ready-backend",
  "version": "1.0.0",
  "description": "Scalable Node.js Express Backend",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \\"src/**/*.ts\\"",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "bullmq": "^4.0.0",
    "compression": "^1.7.4",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-rate-limit": "^6.8.0",
    "helmet": "^7.0.0",
    "ioredis": "^5.3.2",
    "joi": "^17.9.2",
    "jsonwebtoken": "^9.0.1",
    "mongoose": "^7.4.0",
    "morgan": "^1.10.0",
    "nodemailer": "^6.9.4",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "winston": "^3.10.0",
    "zod": "^3.21.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/compression": "^1.7.2",
    "@types/cors": "^2.8.13",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.3",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/morgan": "^1.9.4",
    "@types/node": "^20.4.5",
    "@types/nodemailer": "^6.4.8",
    "@types/supertest": "^2.0.12",
    "@types/swagger-jsdoc": "^6.0.1",
    "@types/swagger-ui-express": "^4.1.3",
    "jest": "^29.6.2",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.1.6"
  }
}`,

  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}`,

  '.env.example': `PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/production_backend

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=super_secret_key_change_in_prod
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=super_refresh_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASS=pass
EMAIL_FROM=noreply@example.com`,

  'docker-compose.yml': `version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
      - MONGODB_URI=mongodb://mongo:27017/production_backend
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - mongo
      - redis
    volumes:
      - ./src:/usr/src/app/src

  mongo:
    image: mongo:6-jammy
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mongo_data:`,

  'Dockerfile': `FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]`,

  'src/server.ts': `import app from './app';
import { connectDB } from './config/db';
import logger from './config/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(\`Server running in \${process.env.NODE_ENV} mode on port \${PORT}\`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();`,

  'src/app.ts': `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/error.middleware';
import routes from './routes';
import logger from './config/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use('/api/', apiLimiter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'API is healthy' });
});

// Swagger docs setup placeholder
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;`,

  'src/config/db.ts': `import mongoose from 'mongoose';
import logger from './logger';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error: any) {
    logger.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};`,

  'src/config/logger.ts': `import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'api-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;`,

  'src/config/redis.ts': `import Redis from 'ioredis';
import logger from './logger';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

export default redis;`,

  'src/middlewares/error.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};`,

  'src/middlewares/rateLimiter.ts': `import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});`,

  'src/routes/index.ts': `import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);

export default router;`,

  'src/routes/auth.routes.ts': `import { Router } from 'express';
import { register, login, verifyOTP } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authValidation } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(authValidation.register), register);
router.post('/login', validate(authValidation.login), login);
router.post('/verify-otp', verifyOTP);

export default router;`,

  'src/middlewares/validate.middleware.ts': `import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error: any) {
    return res.status(400).json({ success: false, errors: error.errors });
  }
};`,

  'src/validations/auth.validation.ts': `import { z } from 'zod';

export const authValidation = {
  register: z.object({
    body: z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    }),
  }),
  login: z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  }),
};`,

  'src/controllers/auth.controller.ts': `import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: user, message: 'OTP sent to email. Please verify.' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, refreshToken, user } = await authService.loginUser(req.body);
    res.status(200).json({ success: true, token, refreshToken, user });
  } catch (err) {
    next(err);
  }
};

export const verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
  // Logic to verify OTP goes here
  res.status(200).json({ success: true, message: 'OTP verified successfully' });
};`,

  'src/services/auth.service.ts': `import { User } from '../models/user.model';
import { createAuthError } from '../utils/errors';
import jwt from 'jsonwebtoken';

export const registerUser = async (data: any) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw createAuthError('Email already exists');

  const user = await User.create({ ...data, otp: '123456' }); // MOCK OTP FOR DEMO
  // TO DO: Dispatch email via BullMQ -> Nodemailer
  return { id: user._id, email: user.email, name: user.name };
};

export const loginUser = async ({ email, password }: any) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw createAuthError('Invalid credentials');
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || 'r_secret', { expiresIn: '7d' });

  return { token, refreshToken, user: { id: user._id, email: user.email, role: user.role } };
};`,

  'src/models/user.model.ts': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiresAt: { type: Date }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password as string, 12);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema);`,

  'src/utils/errors.ts': `export const createAuthError = (message: string) => {
  const error: any = new Error(message);
  error.statusCode = 401;
  return error;
};`,

  'src/services/email.service.ts': `import nodemailer from 'nodemailer';
import logger from '../config/logger';

export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
    });
    logger.info(\`Email sent to \${to}\`);
  } catch (error) {
    logger.error('Error sending email:', error);
  }
};`,

  'README.md': `# Production Ready Backend

A scalable, reliable backend API built with Express, TypeScript, MongoDB, and Redis.

## Features
- **MVC Architecture** with strict layer separation
- **JWT & Refresh Tokens** + OTP stub logic
- **Zod Validation**, Global Error Handlers, Winston Logging
- **Docker Ready** (Dockerfile + Compose)

## Setup
1. \`npm install\`
2. Setup \`.env\` from \`.env.example\`
3. Run \`docker-compose up -d\` (for mongo & redis)
4. \`npm run dev\`

## API
- \`POST /api/v1/auth/register\` -> Create User
- \`POST /api/v1/auth/login\` -> Get JWT 
- \`GET /health\` -> API check
`,
  'postman_collection.json': `{
  "info": {
    "name": "Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type","value": "application/json"}],
            "url": {"raw": "http://localhost:5000/api/v1/auth/register","protocol": "http","host": ["localhost"],"port": "5000","path": ["api","v1","auth","register"]},
            "body": {"mode": "raw","raw": "{\\"name\\": \\"Test User\\", \\"email\\": \\"test@example.com\\", \\"password\\": \\"Password123!\\"} "}
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type","value": "application/json"}],
            "url": {"raw": "http://localhost:5000/api/v1/auth/login","protocol": "http","host": ["localhost"],"port": "5000","path": ["api","v1","auth","login"]},
            "body": {"mode": "raw","raw": "{\\"email\\": \\"test@example.com\\", \\"password\\": \\"Password123!\\"} "}
          }
        }
      ]
    }
  ]
}`
};

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

Object.keys(files).forEach((filePath) => {
  const fullPath = path.join(targetDir, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, files[filePath]);
});

console.log('Production ready backend successfully generated at: ' + targetDir);
