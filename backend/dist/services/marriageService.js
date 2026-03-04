"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const fields = [
    "marriageNo", "marriageDate", "marriagePlace", "groomName", "groomSurname",
    "groomFatherName", "groomMotherName", "groomDateOfBirth", "groomAge",
    "groomChurchOfBaptism", "groomNationality", "groomAddress", "groomProfession",
    "groomMaritalStatus", "groomIfWidowerWhose", "brideName", "brideSurname",
    "brideFatherName", "brideMotherName", "brideDateOfBirth", "brideAge",
    "brideChurchOfBaptism", "brideNationality", "brideAddress", "brideProfession",
    "brideMaritalStatus", "brideIfWidowWhose", "dateOfFirstBanns", "dateOfSecondBanns",
    "dispensation", "firstWitnessName", "firstWitnessSurname", "firstWitnessAddress",
    "secondWitnessName", "secondWitnessSurname", "secondWitnessAddress", "minister",
    "remarks",
];
const create = async (data) => {
    data.marriageNo = await (0, numberGenerator_1.default)("marriages", "marriageNo", "MG");
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO marriages (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM marriages WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM marriages ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM marriages WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE marriages SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM marriages WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.marriageNo) {
        conditions.push("marriageNo LIKE ?");
        params.push(`%${query.marriageNo}%`);
    }
    if (query.groomName) {
        conditions.push("groomName LIKE ?");
        params.push(`%${query.groomName}%`);
    }
    if (query.groomSurname) {
        conditions.push("groomSurname LIKE ?");
        params.push(`%${query.groomSurname}%`);
    }
    if (query.brideName) {
        conditions.push("brideName LIKE ?");
        params.push(`%${query.brideName}%`);
    }
    if (query.brideSurname) {
        conditions.push("brideSurname LIKE ?");
        params.push(`%${query.brideSurname}%`);
    }
    if (query.marriageDateFrom && query.marriageDateTo) {
        conditions.push("marriageDate >= ? AND marriageDate <= ?");
        params.push(query.marriageDateFrom, query.marriageDateTo);
    }
    else if (query.marriageDateFrom) {
        conditions.push("marriageDate = ?");
        params.push(query.marriageDateFrom);
    }
    else if (query.marriageDateTo) {
        conditions.push("marriageDate = ?");
        params.push(query.marriageDateTo);
    }
    if (query.groomDateOfBirthFrom && query.groomDateOfBirthTo) {
        conditions.push("groomDateOfBirth >= ? AND groomDateOfBirth <= ?");
        params.push(query.groomDateOfBirthFrom, query.groomDateOfBirthTo);
    }
    else if (query.groomDateOfBirthFrom) {
        conditions.push("groomDateOfBirth = ?");
        params.push(query.groomDateOfBirthFrom);
    }
    else if (query.groomDateOfBirthTo) {
        conditions.push("groomDateOfBirth = ?");
        params.push(query.groomDateOfBirthTo);
    }
    if (query.brideDateOfBirthFrom && query.brideDateOfBirthTo) {
        conditions.push("brideDateOfBirth >= ? AND brideDateOfBirth <= ?");
        params.push(query.brideDateOfBirthFrom, query.brideDateOfBirthTo);
    }
    else if (query.brideDateOfBirthFrom) {
        conditions.push("brideDateOfBirth = ?");
        params.push(query.brideDateOfBirthFrom);
    }
    else if (query.brideDateOfBirthTo) {
        conditions.push("brideDateOfBirth = ?");
        params.push(query.brideDateOfBirthTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["marriageNo", "groomName", "groomSurname", "brideName", "brideSurname", "marriageDate"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "marriageNo";
    const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
    const limit = parseInt(query.maxRecords) || 5;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM marriages ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM marriages ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
//# sourceMappingURL=marriageService.js.map