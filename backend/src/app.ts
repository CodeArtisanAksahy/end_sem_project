import express from 'express';
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

export default app;