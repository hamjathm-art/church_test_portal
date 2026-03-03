"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const fields = [
    "fullName", "confirmationDate", "officiatingMinister", "sponsorName",
    "churchName", "churchAddress", "churchContact",
];
const create = async (data) => {
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO confirmations (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM confirmations WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM confirmations ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM confirmations WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE confirmations SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM confirmations WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.fullName) {
        conditions.push("fullName LIKE ?");
        params.push(`%${query.fullName}%`);
    }
    if (query.officiatingMinister) {
        conditions.push("officiatingMinister LIKE ?");
        params.push(`%${query.officiatingMinister}%`);
    }
    if (query.churchName) {
        conditions.push("churchName LIKE ?");
        params.push(`%${query.churchName}%`);
    }
    if (query.churchAddress) {
        conditions.push("churchAddress LIKE ?");
        params.push(`%${query.churchAddress}%`);
    }
    if (query.confirmationDateFrom && query.confirmationDateTo) {
        conditions.push("confirmationDate >= ? AND confirmationDate <= ?");
        params.push(query.confirmationDateFrom, query.confirmationDateTo);
    }
    else if (query.confirmationDateFrom) {
        conditions.push("confirmationDate = ?");
        params.push(query.confirmationDateFrom);
    }
    else if (query.confirmationDateTo) {
        conditions.push("confirmationDate = ?");
        params.push(query.confirmationDateTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["fullName", "confirmationDate", "officiatingMinister", "churchName"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "fullName";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM confirmations ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM confirmations ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
//# sourceMappingURL=confirmationService.js.map