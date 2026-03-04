"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.remove = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const fields = [
    "requestNo", "fullName", "phone", "email", "address", "city", "pinCode",
    "requestType", "status",
    "baptismFullName", "baptismDateOfBirth", "baptismDate", "baptismParents", "baptismGodparents",
    "confirmationFullName", "confirmationDate",
    "marriageBrideName", "marriageGroomName", "marriageDate", "marriageChurch",
    "burialDeceasedName", "burialDateOfDeath", "burialDate",
    "massType", "massDateTimePreference",
    "proposedWeddingDate", "prepBrideName", "prepGroomName", "weddingLocation", "coupleContact",
    "noObjectionFullName", "noObjectionDateOfBirth", "noObjectionPlaceOfBirth", "noObjectionReason",
    "otherDetails",
    "fee", "paymentMode", "paymentDetails",
    "receivedBy", "dateReceived", "actionTaken", "certificateIssuedDate", "paymentReceived", "amountReceived",
];
const create = async (data) => {
    data.requestNo = await (0, numberGenerator_1.default)("parish_requests", "requestNo", "PR");
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO parish_requests (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM parish_requests WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM parish_requests ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM parish_requests WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE parish_requests SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM parish_requests WHERE id = ?", [id]);
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
    if (query.phone) {
        conditions.push("phone LIKE ?");
        params.push(`%${query.phone}%`);
    }
    if (query.requestType) {
        conditions.push("requestType = ?");
        params.push(query.requestType);
    }
    if (query.status) {
        conditions.push("status = ?");
        params.push(query.status);
    }
    if (query.dateReceivedFrom && query.dateReceivedTo) {
        conditions.push("dateReceived >= ? AND dateReceived <= ?");
        params.push(query.dateReceivedFrom, query.dateReceivedTo);
    }
    else if (query.dateReceivedFrom) {
        conditions.push("dateReceived = ?");
        params.push(query.dateReceivedFrom);
    }
    else if (query.dateReceivedTo) {
        conditions.push("dateReceived = ?");
        params.push(query.dateReceivedTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["fullName", "requestType", "status", "dateReceived", "created_at"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "created_at";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM parish_requests ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM parish_requests ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
const remove = async (id) => {
    const [result] = await db_1.default.query("DELETE FROM parish_requests WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
exports.remove = remove;
//# sourceMappingURL=parishRequestService.js.map