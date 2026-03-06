"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const generateTokens = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
    const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
    return { accessToken, refreshToken };
};
const register = async (data) => {
    const { name, email, password } = data;
    const [existing] = await db_1.default.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
        throw new Error("Email already registered");
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 8);
    const [result] = await db_1.default.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
    return { id: result.insertId, name, email };
};
exports.register = register;
const login = async (data) => {
    const { email, password } = data;
    const [rows] = await db_1.default.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
        throw new Error("Invalid email or password");
    }
    const user = rows[0];
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }
    const tokens = generateTokens(user);
    return {
        user: { id: user.id, name: user.name, email: user.email },
        ...tokens,
    };
};
exports.login = login;
const refreshAccessToken = async (refreshToken) => {
    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const [rows] = await db_1.default.query("SELECT * FROM users WHERE id = ?", [decoded.id]);
    if (rows.length === 0) {
        throw new Error("User not found");
    }
    const user = rows[0];
    const accessToken = jsonwebtoken_1.default.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: "2h" });
    return { accessToken };
};
exports.refreshAccessToken = refreshAccessToken;
//# sourceMappingURL=authService.js.map