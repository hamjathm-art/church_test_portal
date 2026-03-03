"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const fields = [
    "burialNo", "dateOfBurial", "fullName", "surname", "age", "nationality",
    "address", "profession", "relationship", "causeOfDeath", "lastSacraments",
    "dateOfDeath", "burialPlace", "minister", "remarks",
];
const escapeField = (f) => (f === "relationship" ? "`relationship`" : f);
const create = async (data) => {
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const fieldNames = fields.map(escapeField).join(", ");
    const [result] = await db_1.default.query(`INSERT INTO burials (${fieldNames}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM burials WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM burials ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM burials WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${escapeField(f)} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE burials SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM burials WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.burialNo) {
        conditions.push("burialNo LIKE ?");
        params.push(`%${query.burialNo}%`);
    }
    if (query.fullName) {
        conditions.push("fullName LIKE ?");
        params.push(`%${query.fullName}%`);
    }
    if (query.surname) {
        conditions.push("surname LIKE ?");
        params.push(`%${query.surname}%`);
    }
    if (query.relationship) {
        conditions.push("`relationship` LIKE ?");
        params.push(`%${query.relationship}%`);
    }
    if (query.causeOfDeath) {
        conditions.push("causeOfDeath LIKE ?");
        params.push(`%${query.causeOfDeath}%`);
    }
    if (query.minister) {
        conditions.push("minister LIKE ?");
        params.push(`%${query.minister}%`);
    }
    // Date of Burial range
    if (query.dateOfBurialFrom && query.dateOfBurialTo) {
        conditions.push("dateOfBurial >= ? AND dateOfBurial <= ?");
        params.push(query.dateOfBurialFrom, query.dateOfBurialTo);
    }
    else if (query.dateOfBurialFrom) {
        conditions.push("dateOfBurial = ?");
        params.push(query.dateOfBurialFrom);
    }
    else if (query.dateOfBurialTo) {
        conditions.push("dateOfBurial = ?");
        params.push(query.dateOfBurialTo);
    }
    // Date of Death range
    if (query.dateOfDeathFrom && query.dateOfDeathTo) {
        conditions.push("dateOfDeath >= ? AND dateOfDeath <= ?");
        params.push(query.dateOfDeathFrom, query.dateOfDeathTo);
    }
    else if (query.dateOfDeathFrom) {
        conditions.push("dateOfDeath = ?");
        params.push(query.dateOfDeathFrom);
    }
    else if (query.dateOfDeathTo) {
        conditions.push("dateOfDeath = ?");
        params.push(query.dateOfDeathTo);
    }
    // Age range
    if (query.ageFrom && query.ageTo) {
        conditions.push("CAST(age AS UNSIGNED) >= ? AND CAST(age AS UNSIGNED) <= ?");
        params.push(parseInt(query.ageFrom), parseInt(query.ageTo));
    }
    else if (query.ageFrom) {
        conditions.push("CAST(age AS UNSIGNED) >= ?");
        params.push(parseInt(query.ageFrom));
    }
    else if (query.ageTo) {
        conditions.push("CAST(age AS UNSIGNED) <= ?");
        params.push(parseInt(query.ageTo));
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["burialNo", "fullName", "surname", "dateOfBurial", "dateOfDeath"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "burialNo";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM burials ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM burials ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
//# sourceMappingURL=burialService.js.map