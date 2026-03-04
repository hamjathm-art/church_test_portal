"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const fields = [
    "objectionNo", "fullName", "dateOfBirth", "placeOfBirth", "reason", "recipientDetails",
];
const create = async (data) => {
    data.objectionNo = await (0, numberGenerator_1.default)("no_objections", "objectionNo", "NO");
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO no_objections (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM no_objections WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM no_objections ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE no_objections SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM no_objections WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM no_objections WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.fullName) {
        conditions.push("fullName LIKE ?");
        params.push(`%${query.fullName}%`);
    }
    if (query.placeOfBirth) {
        conditions.push("placeOfBirth LIKE ?");
        params.push(`%${query.placeOfBirth}%`);
    }
    if (query.reason) {
        conditions.push("reason LIKE ?");
        params.push(`%${query.reason}%`);
    }
    if (query.recipientDetails) {
        conditions.push("recipientDetails LIKE ?");
        params.push(`%${query.recipientDetails}%`);
    }
    if (query.dateOfBirthFrom && query.dateOfBirthTo) {
        conditions.push("dateOfBirth >= ? AND dateOfBirth <= ?");
        params.push(query.dateOfBirthFrom, query.dateOfBirthTo);
    }
    else if (query.dateOfBirthFrom) {
        conditions.push("dateOfBirth = ?");
        params.push(query.dateOfBirthFrom);
    }
    else if (query.dateOfBirthTo) {
        conditions.push("dateOfBirth = ?");
        params.push(query.dateOfBirthTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["fullName", "dateOfBirth", "reason"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "fullName";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM no_objections ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM no_objections ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
//# sourceMappingURL=noObjectionService.js.map