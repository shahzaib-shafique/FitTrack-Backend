import jwt from "jsonwebtoken";

const COOKIE_NAME = "fittrack_token";

export const signToken = (userId) => {
  return jwt.sign({ _id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const setCookieToken = (res, userId) => {
  const token = signToken(userId);
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  return token;
};

export const clearCookieToken = (res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "strict",
  });
};

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
