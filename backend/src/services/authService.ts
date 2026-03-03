import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { User, JwtPayload } from "../types";

const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { id: user.id, name: user.name, email: user.email } as JwtPayload,
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const register = async (data: { name: string; email: string; password: string }) => {
  const { name, email, password } = data;

  const [existing] = await pool.query<User[]>("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword]
  );

  return { id: result.insertId, name, email };
};

const login = async (data: { email: string; password: string }) => {
  const { email, password } = data;

  const [rows] = await pool.query<User[]>("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const tokens = generateTokens(user);
  return {
    user: { id: user.id, name: user.name, email: user.email },
    ...tokens,
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: number };
  const [rows] = await pool.query<User[]>("SELECT * FROM users WHERE id = ?", [decoded.id]);
  if (rows.length === 0) {
    throw new Error("User not found");
  }
  const user = rows[0];
  const accessToken = jwt.sign(
    { id: user.id, name: user.name, email: user.email } as JwtPayload,
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" }
  );
  return { accessToken };
};

export { register, login, refreshAccessToken };
