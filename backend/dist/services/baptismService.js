"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.remove = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const fields = [
    "baptismNo", "dateOfBaptism", "dateOfBirth", "age", "fullName", "surname",
    "fatherName", "motherName", "fatherResidence", "fatherProfession", "nationality",
    "placeofBirth", "godfatherName", "godfatherSurname", "godfatherResidence",
    "godmotherName", "godmotherSurname", "godmotherResidence", "placeOfBaptism",
    "priestName", "remarks", "confirmedOn", "confirmedAt", "dateOfMarriage",
    "marriedTo", "placeOfMarriage",
];
const create = async (data) => {
    data.baptismNo = await (0, numberGenerator_1.default)("baptisms", "baptismNo", "BP");
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO baptisms (${fields.join(", ")}) VALUES (${placeholders})`, values);
    return { id: result.insertId, ...Object.fromEntries(fields.map((f, i) => [f, values[i]])) };
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM baptisms ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM baptisms WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE baptisms SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    return { id: Number(id), ...Object.fromEntries(fields.map((f) => [f, data[f] !== undefined ? data[f] : ""])) };
};
exports.update = update;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.baptismNo) {
        conditions.push("baptismNo LIKE ?");
        params.push(`%${query.baptismNo}%`);
    }
    if (query.fullName) {
        conditions.push("fullName LIKE ?");
        params.push(`%${query.fullName}%`);
    }
    if (query.surname) {
        conditions.push("surname LIKE ?");
        params.push(`%${query.surname}%`);
    }
    if (query.fatherName) {
        conditions.push("fatherName LIKE ?");
        params.push(`%${query.fatherName}%`);
    }
    if (query.motherName) {
        conditions.push("motherName LIKE ?");
        params.push(`%${query.motherName}%`);
    }
    if (query.dateOfBaptismFrom && query.dateOfBaptismTo) {
        conditions.push("dateOfBaptism >= ? AND dateOfBaptism <= ?");
        params.push(query.dateOfBaptismFrom, query.dateOfBaptismTo);
    }
    else if (query.dateOfBaptismFrom) {
        conditions.push("dateOfBaptism = ?");
        params.push(query.dateOfBaptismFrom);
    }
    else if (query.dateOfBaptismTo) {
        conditions.push("dateOfBaptism = ?");
        params.push(query.dateOfBaptismTo);
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
    if (query.confirmedOnFrom && query.confirmedOnTo) {
        conditions.push("confirmedOn >= ? AND confirmedOn <= ?");
        params.push(query.confirmedOnFrom, query.confirmedOnTo);
    }
    else if (query.confirmedOnFrom) {
        conditions.push("confirmedOn = ?");
        params.push(query.confirmedOnFrom);
    }
    else if (query.confirmedOnTo) {
        conditions.push("confirmedOn = ?");
        params.push(query.confirmedOnTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["baptismNo", "fullName", "surname", "dateOfBaptism", "dateOfBirth"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "baptismNo";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM baptisms ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM baptisms ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
const remove = async (id) => {
    const [result] = await db_1.default.query("DELETE FROM baptisms WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
exports.remove = remove;
//# sourceMappingURL=baptismService.js.map