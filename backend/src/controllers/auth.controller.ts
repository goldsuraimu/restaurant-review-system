import type { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  refreshUserToken,
  logoutUser,
} from '#/services/auth/auth.service';

// #region POST /auth/register 註冊
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const userData = { ...req.body };
    const newUser = await registerUser(userData);

    res.status(201).json({ result: newUser });
  } catch (err) {
    next(err);
  }
}
// #endregion

// #region POST /auth/login 登入
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await loginUser(
      email,
      password
    );

    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 分鐘
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      })
      .status(200)
      .json({ result: user });
  } catch (err) {
    next(err);
  }
}
// #endregion

// #region POST /auth/refresh-token 重新整理 Token
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies['refresh_token'];
    const { accessToken, refreshToken } = await refreshUserToken(token);

    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 分鐘
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
      })
      .sendStatus(204);
  } catch (err) {
    next(err);
  }
}
// #endregion

// #region POST /auth/logout 登出
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies['refresh_token'];
    await logoutUser(token);

    res
      .clearCookie('access_token')
      .clearCookie('refresh_token')
      .sendStatus(204)
  } catch (err) {
    next(err);
  }
}
// #endregion
