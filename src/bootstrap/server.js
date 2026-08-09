import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import logger from '../app/middleware/logger.middleware.js';
import { NotFoundError } from '../lib/error-definitions.js';
import errorMiddleware from '../app/middleware/error-middleware.js';
import config from '../config/app.config.js';
import {getSecondsFromNow} from '../lib/util.js';
import express from 'express';
import {createServer} from 'http';
import {authRouter} from '../modules/auth/api.js';
import { adminRouter } from '../modules/admin/admin.routes.js';
import {singleSavingsRouter} from '../modules/singleSavings/singleSavingsRoutes.js';
import { duoSavingsRouter } from '../modules/duoSavings/duoSavingsRoutes.js';
import { familySavingsRouter } from '../modules/familySavings/familySavingsRoutes.js';
import {messageRouter} from '../modules/messages/messageRoutes.js';
import cookieParser  from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../docs/swagger.js';
import '../lib/cronJobs.js';
import {Server} from 'socket.io';

const app = express();
const server = createServer(app);



export const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(logger());
app.use(
    cookieParser({
        httpOnly: true,
        secure: config.environment === 'production',
        sameSite: 'strict',
        maxAge: getSecondsFromNow(config.jwt.expiration)
    })
)

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'server is running'
    });
})
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/singleSavings', singleSavingsRouter);
app.use('/api/duoSavings', duoSavingsRouter);
app.use('/api/familySavings', familySavingsRouter);
app.use('/api/messages', messageRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
    next(new NotFoundError(`the requested route ${req.originalUrl} does not exist on this server`));
});


io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  /**
   * User joins their conversation room.
   * Example:
   * socket.emit("joinConversation", conversationId);
   */
  socket.on("joinConversation", (conversationId) => {
    socket.join(`conversation:${conversationId}`);

    console.log(
      `Socket ${socket.id} joined conversation:${conversationId}`
    );
  });

  /**
   * Leave conversation.
   */
  socket.on("leaveConversation", (conversationId) => {
    socket.leave(`conversation:${conversationId}`);

    console.log(
      `Socket ${socket.id} left conversation:${conversationId}`
    );
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(errorMiddleware);

export {app, server};
