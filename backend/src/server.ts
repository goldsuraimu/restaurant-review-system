import dotenv from 'dotenv';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { attachRequestId } from '#/middleware/requestId';
import { globalErrorHandler } from '#/middleware/globalErrorHandler';

import restaurantsRouter from '#/routes/restaurants.routes';
import ownerRouter from './routes/owner'
import AuthRouter from '#/routes/auth.routes';
import usersRouter from '#/routes/users.routes';
import uploadRoutes from '#/routes/upload.routes';
import utilsRoutes from '#/routes/utils.routes';
import AdminRouter from '#/routes/admin';

const app: Express = express();


const port = Number(process.env.PORT) || 3000;

// CORS 設定
const corsOptions: cors.CorsOptions = {
  origin: process.env.CORS_ORIGIN, // 前端的 URL
  credentials: true,               // 允許跨域發送 cookie
};


// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(attachRequestId);

// 路由
app.use('/api/auth', AuthRouter);
app.use('/api/users', usersRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/owner', ownerRouter);
app.use('/admin', AdminRouter);
app.use('/api/upload', uploadRoutes)
app.use('/api/utils', utilsRoutes)


// 全域錯誤處理 middleware
app.use(globalErrorHandler);


// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

