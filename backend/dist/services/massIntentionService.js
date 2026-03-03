"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvailability = exports.search = exports.remove = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const fields = [
    "fullName", "contactNumber", "emailAddress",
    "typeOfIntention", "otherIntention", "nameOfPersonForIntention", "intentionDetails",
    "slot1Date", "slot1Status", "slot2Date", "slot2Status",
    "slot3Date", "slot3Status", "slot4Date", "slot4Status",
    "preferredDateTime",
    "offeringAmount", "paymentStatus", "paymentMode", "bankName", "accountNumber", "ifscCode", "referenceNumber",
    "specialNotes", "status",
    "receivedBy", "receivedDate", "confirmedDateTime", "paymentReceived", "receiptNo",
];
const create = async (data) => {
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO mass_intentions (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM mass_intentions WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM mass_intentions ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM mass_intentions WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE mass_intentions SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM mass_intentions WHERE id = ?", [id]);
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
    if (query.contactNumber) {
        conditions.push("contactNumber LIKE ?");
        params.push(`%${query.contactNumber}%`);
    }
    if (query.typeOfIntention) {
        conditions.push("typeOfIntention = ?");
        params.push(query.typeOfIntention);
    }
    if (query.status) {
        conditions.push("status = ?");
        params.push(query.status);
    }
    if (query.receivedDateFrom && query.receivedDateTo) {
        conditions.push("receivedDate >= ? AND receivedDate <= ?");
        params.push(query.receivedDateFrom, query.receivedDateTo);
    }
    else if (query.receivedDateFrom) {
        conditions.push("receivedDate = ?");
        params.push(query.receivedDateFrom);
    }
    else if (query.receivedDateTo) {
        conditions.push("receivedDate = ?");
        params.push(query.receivedDateTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["fullName", "typeOfIntention", "status", "receivedDate", "created_at"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "created_at";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM mass_intentions ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM mass_intentions ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
const checkAvailability = async (dates, excludeId) => {
    const result = {};
    for (let i = 1; i <= 4; i++) {
        const date = dates[`slot${i}Date`];
        if (date) {
            let query = `SELECT COUNT(*) as total FROM mass_intentions WHERE slot${i}Date = ? AND slot${i}Status != ''`;
            const params = [date];
            if (excludeId) {
                query += ` AND id != ?`;
                params.push(excludeId);
            }
            const [rows] = await db_1.default.query(query, params);
            result[`slot${i}`] = rows[0].total > 0;
        }
        else {
            result[`slot${i}`] = false;
        }
    }
    return result;
};
exports.checkAvailability = checkAvailability;
const remove = async (id) => {
    const [result] = await db_1.default.query("DELETE FROM mass_intentions WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
exports.remove = remove;
//# sourceMappingURL=massIntentionService.js.map