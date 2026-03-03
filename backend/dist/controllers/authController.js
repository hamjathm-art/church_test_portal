"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/authService"));
const register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === "Email already registered") {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
            if (error.name === "ValidationError") {
                res.status(400).json({ success: false, message: error.message });
                return;
            }
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        if (error instanceof Error && error.message === "Invalid email or password") {
            res.status(401).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({ success: false, message: "Refresh token required" });
            return;
        }
        const result = await authService.refreshAccessToken(refreshToken);
        res.status(200).json({ success: true, data: result });
    }
    catch {
        res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }
};
exports.refresh = refresh;
//# sourceMappingURL=authController.js.map