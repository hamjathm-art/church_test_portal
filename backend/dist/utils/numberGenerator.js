"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const generateNextNumber = async (tableName, fieldName, prefix) => {
    const [rows] = await db_1.default.query(`SELECT ${fieldName} as lastNumber FROM ${tableName} WHERE ${fieldName} LIKE ? ORDER BY ${fieldName} DESC LIMIT 1`, [`${prefix}%`]);
    let nextNum = 1;
    if (rows.length > 0 && rows[0].lastNumber) {
        const numPart = rows[0].lastNumber.replace(prefix, "");
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed)) {
            nextNum = parsed + 1;
        }
    }
    return `${prefix}${String(nextNum).padStart(4, "0")}`;
};
exports.default = generateNextNumber;
//# sourceMappingURL=numberGenerator.js.map