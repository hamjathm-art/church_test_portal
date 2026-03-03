"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleStatus = exports.search = exports.remove = exports.update = exports.getById = exports.getAll = exports.create = void 0;
const db_1 = __importDefault(require("../config/db"));
const fields = [
    "title", "slug", "description", "category", "liturgicalSeason",
    "announcementDate", "status", "isRecurring",
];
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s]+/g, "-")
        .replace(/^-+|-+$/g, "");
};
const getUniqueSlug = async (baseSlug, excludeId) => {
    let slug = baseSlug;
    let counter = 0;
    while (true) {
        const checkSlug = counter === 0 ? slug : `${slug}-${counter}`;
        const excludeClause = excludeId ? " AND id != ?" : "";
        const params = [checkSlug];
        if (excludeId)
            params.push(excludeId);
        const [rows] = await db_1.default.query(`SELECT id FROM announcements WHERE slug = ?${excludeClause}`, params);
        if (rows.length === 0)
            return checkSlug;
        counter++;
    }
};
const create = async (data) => {
    const slug = await getUniqueSlug(generateSlug(data.title || "announcement"));
    data.slug = slug;
    if (!data.status)
        data.status = "Draft";
    if (!data.isRecurring)
        data.isRecurring = "No";
    const values = fields.map((f) => data[f] || "");
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await db_1.default.query(`INSERT INTO announcements (${fields.join(", ")}) VALUES (${placeholders})`, values);
    const [rows] = await db_1.default.query("SELECT * FROM announcements WHERE id = ?", [result.insertId]);
    return rows[0];
};
exports.create = create;
const getAll = async () => {
    const [rows] = await db_1.default.query("SELECT * FROM announcements ORDER BY created_at DESC");
    return rows;
};
exports.getAll = getAll;
const getById = async (id) => {
    const [rows] = await db_1.default.query("SELECT * FROM announcements WHERE id = ?", [id]);
    return rows[0] || null;
};
exports.getById = getById;
const update = async (id, data) => {
    if (data.title) {
        data.slug = await getUniqueSlug(generateSlug(data.title), id);
    }
    const setClauses = fields.map((f) => `${f} = ?`).join(", ");
    const values = fields.map((f) => data[f] !== undefined ? data[f] : "");
    values.push(id);
    const [result] = await db_1.default.query(`UPDATE announcements SET ${setClauses} WHERE id = ?`, values);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM announcements WHERE id = ?", [id]);
    return rows[0];
};
exports.update = update;
const toggleStatus = async (id, status) => {
    const [result] = await db_1.default.query("UPDATE announcements SET status = ? WHERE id = ?", [status, id]);
    if (result.affectedRows === 0)
        return null;
    const [rows] = await db_1.default.query("SELECT * FROM announcements WHERE id = ?", [id]);
    return rows[0];
};
exports.toggleStatus = toggleStatus;
const search = async (query) => {
    const conditions = [];
    const params = [];
    if (query.title) {
        conditions.push("title LIKE ?");
        params.push(`%${query.title}%`);
    }
    if (query.category) {
        conditions.push("category = ?");
        params.push(query.category);
    }
    if (query.liturgicalSeason) {
        conditions.push("liturgicalSeason = ?");
        params.push(query.liturgicalSeason);
    }
    if (query.status) {
        conditions.push("status = ?");
        params.push(query.status);
    }
    if (query.announcementDateFrom && query.announcementDateTo) {
        conditions.push("announcementDate >= ? AND announcementDate <= ?");
        params.push(query.announcementDateFrom, query.announcementDateTo);
    }
    else if (query.announcementDateFrom) {
        conditions.push("announcementDate >= ?");
        params.push(query.announcementDateFrom);
    }
    else if (query.announcementDateTo) {
        conditions.push("announcementDate <= ?");
        params.push(query.announcementDateTo);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const allowedSortFields = ["title", "category", "liturgicalSeason", "status", "announcementDate"];
    const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "announcementDate";
    const sortOrder = query.sortOrder === "asc" ? "ASC" : "DESC";
    const limit = parseInt(query.maxRecords) || 25;
    const page = parseInt(query.page) || 1;
    const offset = (page - 1) * limit;
    const countParams = [...params];
    const dataParams = [...params, limit, offset];
    const [countResult] = await db_1.default.query(`SELECT COUNT(*) as total FROM announcements ${whereClause}`, countParams);
    const [data] = await db_1.default.query(`SELECT * FROM announcements ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`, dataParams);
    return { data, totalCount: countResult[0].total, page, limit };
};
exports.search = search;
const remove = async (id) => {
    const [result] = await db_1.default.query("DELETE FROM announcements WHERE id = ?", [id]);
    return result.affectedRows > 0;
};
exports.remove = remove;
//# sourceMappingURL=announcementService.js.map