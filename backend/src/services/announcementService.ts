import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { Announcement, CountRow, SearchResult } from "../types";

const fields: string[] = [
  "title", "slug", "description", "category", "liturgicalSeason",
  "announcementDate", "status", "isRecurring",
];

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getUniqueSlug = async (baseSlug: string, excludeId?: string | number): Promise<string> => {
  let slug = baseSlug;
  let counter = 0;
  while (true) {
    const checkSlug = counter === 0 ? slug : `${slug}-${counter}`;
    const excludeClause = excludeId ? " AND id != ?" : "";
    const params: (string | number)[] = [checkSlug];
    if (excludeId) params.push(excludeId);
    const [rows] = await pool.query<Announcement[]>(
      `SELECT id FROM announcements WHERE slug = ?${excludeClause}`,
      params
    );
    if (rows.length === 0) return checkSlug;
    counter++;
  }
};

const create = async (data: Record<string, string>): Promise<Announcement> => {
  const slug = await getUniqueSlug(generateSlug(data.title || "announcement"));
  data.slug = slug;
  if (!data.status) data.status = "Draft";
  if (!data.isRecurring) data.isRecurring = "No";

  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO announcements (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  const [rows] = await pool.query<Announcement[]>("SELECT * FROM announcements WHERE id = ?", [result.insertId]);
  return rows[0];
};

const getAll = async (): Promise<Announcement[]> => {
  const [rows] = await pool.query<Announcement[]>("SELECT * FROM announcements ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<Announcement | null> => {
  const [rows] = await pool.query<Announcement[]>("SELECT * FROM announcements WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<Announcement | null> => {
  if (data.title) {
    data.slug = await getUniqueSlug(generateSlug(data.title), id);
  }

  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE announcements SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query<Announcement[]>("SELECT * FROM announcements WHERE id = ?", [id]);
  return rows[0];
};

const toggleStatus = async (id: string | number, status: string): Promise<Announcement | null> => {
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE announcements SET status = ? WHERE id = ?",
    [status, id]
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query<Announcement[]>("SELECT * FROM announcements WHERE id = ?", [id]);
  return rows[0];
};

const search = async (query: Record<string, string>): Promise<SearchResult<Announcement>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

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
  } else if (query.announcementDateFrom) {
    conditions.push("announcementDate >= ?");
    params.push(query.announcementDateFrom);
  } else if (query.announcementDateTo) {
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
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM announcements ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<Announcement[]>(
    `SELECT * FROM announcements ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

const remove = async (id: string | number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM announcements WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export { create, getAll, getById, update, remove, search, toggleStatus };
