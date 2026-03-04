"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const fields = [
    "receiptNo", "dateOfReceipt", "receivedFrom", "familyCardNo",
    "amount", "towards", "details",
];
const create = async (data) => {
    data.receiptNo = await (0, numberGenerator_1.default)("receipts", "receiptNo", "RC");
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO receipts (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM receipts WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM receipts ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM receipts WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE receipts SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM receipts WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.receiptNo) {
        conditions.push("receiptNo LIKE ?");
        params.push(`%${query.receiptNo}%`);
    }
    if (query.receivedFrom) {
        conditions.push("receivedFrom LIKE ?");
        params.push(`%${query.receivedFrom}%`);
    }
    if (query.familyCardNo) {
        conditions.push("familyCardNo LIKE ?");
        params.push(`%${query.familyCardNo}%`);
    }
    if (query.towards) {
        conditions.push("towards = ?");
        params.push(query.towards);
    }
    if (query.amount) {
        conditions.push("amount LIKE ?");
        params.push(`%${query.amount}%`);
    }
    if (query.dateOfReceiptFrom && query.dateOfReceiptTo) {
        conditions.push("dateOfReceipt >= ? AND dateOfReceipt <= ?");
        params.push(query.dateOfReceiptFrom, query.dateOfReceiptTo);
    }
    else if (query.dateOfReceiptFrom) {
        conditions.push("dateOfReceipt = ?");
        params.push(query.dateOfReceiptFrom);
    }
    else if (query.dateOfReceiptTo) {
        conditions.push("dateOfReceipt = ?");
        params.push(query.dateOfReceiptTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["receivedFrom", "receiptNo", "dateOfReceipt", "amount"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "receivedFrom";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM receipts ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM receipts ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
//# sourceMappingURL=receiptService.js.map