"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const fields = [
    "scc", "familyId", "registrationDate", "salutation", "firstName", "middleName",
    "surname", "address1", "address2", "address3", "pincode", "res", "office",
    "mobile", "fax", "email", "familyType", "motherTongue", "otherLanguages",
    "stateOfOrigin", "previousParish", "sinceMonth", "sinceYear", "housingType",
    "housingStatus", "remarks",
];
const create = async (data) => {
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO families (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM families WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM families ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM families WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE families SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM families WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.scc) {
        conditions.push("scc LIKE ?");
        params.push(`%${query.scc}%`);
    }
    if (query.firstName) {
        conditions.push("firstName LIKE ?");
        params.push(`%${query.firstName}%`);
    }
    if (query.surname) {
        conditions.push("surname LIKE ?");
        params.push(`%${query.surname}%`);
    }
    if (query.address2) {
        conditions.push("address2 LIKE ?");
        params.push(`%${query.address2}%`);
    }
    if (query.pincode) {
        conditions.push("pincode LIKE ?");
        params.push(`%${query.pincode}%`);
    }
    if (query.mobile) {
        conditions.push("mobile LIKE ?");
        params.push(`%${query.mobile}%`);
    }
    if (query.email) {
        conditions.push("email LIKE ?");
        params.push(`%${query.email}%`);
    }
    if (query.stateOfOrigin) {
        conditions.push("stateOfOrigin LIKE ?");
        params.push(`%${query.stateOfOrigin}%`);
    }
    if (query.registrationDateFrom && query.registrationDateTo) {
        conditions.push("registrationDate >= ? AND registrationDate <= ?");
        params.push(query.registrationDateFrom, query.registrationDateTo);
    }
    else if (query.registrationDateFrom) {
        conditions.push("registrationDate = ?");
        params.push(query.registrationDateFrom);
    }
    else if (query.registrationDateTo) {
        conditions.push("registrationDate = ?");
        params.push(query.registrationDateTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["firstName", "surname", "registrationDate", "scc"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "firstName";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM families ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM families ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
//# sourceMappingURL=familyService.js.map