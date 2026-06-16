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

    const isProduction = process.env.NODE_ENV === 'production';
    // Vercel(frontend) + Render(backend) 為跨站部署，
    // SameSite=None 才能讓瀏覽器攜帶 Cookie。
    // 若前後端共用主網域（如 app.example.com / api.example.com），
    // 建議改回 access_token的sameSite: 'lax' 和 refresh_token的sameSite: 'strict' ， 
    // 以提升 CSRF 防護。
    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax', 
        secure: isProduction,
        maxAge: 15 * 60 * 1000, // 15 分鐘
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'strict',
        secure: isProduction,
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

    const isProduction = process.env.NODE_ENV === 'production';
    // Vercel(frontend) + Render(backend) 為跨站部署，
    // SameSite=None 才能讓瀏覽器攜帶 Cookie。
    // 若前後端共用主網域（如 app.example.com / api.example.com），
    // 建議改回 access_token的sameSite: 'lax' 和 refresh_token的sameSite: 'strict' ， 
    // 以提升 CSRF 防護。
    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
        maxAge: 15 * 60 * 1000, // 15 分鐘
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'strict',
        secure: isProduction,
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
