"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const fields = [
    "voucherNo", "voucherDate", "payTo", "debitAccount", "amount",
    "tds", "paymentMode", "chequeNumber", "details",
];
const create = async (data) => {
    data.voucherNo = await (0, numberGenerator_1.default)("vouchers", "voucherNo", "VC");
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO vouchers (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM vouchers WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM vouchers ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM vouchers WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE vouchers SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM vouchers WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.voucherNo) {
        conditions.push("voucherNo LIKE ?");
        params.push(`%${query.voucherNo}%`);
    }
    if (query.payTo) {
        conditions.push("payTo LIKE ?");
        params.push(`%${query.payTo}%`);
    }
    if (query.debitAccount) {
        conditions.push("debitAccount = ?");
        params.push(query.debitAccount);
    }
    if (query.paymentMode) {
        conditions.push("paymentMode = ?");
        params.push(query.paymentMode);
    }
    if (query.chequeNumber) {
        conditions.push("chequeNumber LIKE ?");
        params.push(`%${query.chequeNumber}%`);
    }
    if (query.voucherDateFrom && query.voucherDateTo) {
        conditions.push("voucherDate >= ? AND voucherDate <= ?");
        params.push(query.voucherDateFrom, query.voucherDateTo);
    }
    else if (query.voucherDateFrom) {
        conditions.push("voucherDate = ?");
        params.push(query.voucherDateFrom);
    }
    else if (query.voucherDateTo) {
        conditions.push("voucherDate = ?");
        params.push(query.voucherDateTo);
    }
    if (query.amountFrom && query.amountTo) {
        conditions.push("CAST(amount AS UNSIGNED) >= ? AND CAST(amount AS UNSIGNED) <= ?");
        params.push(parseInt(query.amountFrom), parseInt(query.amountTo));
    }
    else if (query.amountFrom) {
        conditions.push("CAST(amount AS UNSIGNED) >= ?");
        params.push(parseInt(query.amountFrom));
    }
    else if (query.amountTo) {
        conditions.push("CAST(amount AS UNSIGNED) <= ?");
        params.push(parseInt(query.amountTo));
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["voucherNo", "payTo", "voucherDate", "amount", "debitAccount"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "voucherNo";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 100;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM vouchers ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM vouchers ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
//# sourceMappingURL=voucherService.js.map