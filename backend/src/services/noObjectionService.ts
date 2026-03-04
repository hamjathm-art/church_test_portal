import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { NoObjection, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
  "objectionNo", "fullName", "dateOfBirth", "placeOfBirth", "reason", "recipientDetails",
];

const create = async (data: Record<string, string>): Promise<NoObjection> => {
  data.objectionNo = await generateNextNumber("no_objections", "objectionNo", "NO");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO no_objections (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  return { id: result.insertId, ...Object.fromEntries(fields.map((f, i) => [f, values[i]])) } as NoObjection;
};

const getAll = async (): Promise<NoObjection[]> => {
  const [rows] = await pool.query<NoObjection[]>("SELECT * FROM no_objections ORDER BY created_at DESC");
  return rows;
};

const update = async (id: string | number, data: Record<string, string>): Promise<NoObjection | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE no_objections SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return { id: Number(id), ...Object.fromEntries(fields.map((f) => [f, data[f] !== undefined ? data[f] : ""])) } as NoObjection;
};

const getById = async (id: string | number): Promise<NoObjection | null> => {
  const [rows] = await pool.query<NoObjection[]>("SELECT * FROM no_objections WHERE id = ?", [id]);
  return rows[0] || null;
};

const search = async (query: Record<string, string>): Promise<SearchResult<NoObjection>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.objectionNo) {
    conditions.push("objectionNo LIKE ?");
    params.push(`%${query.objectionNo}%`);
  }
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
  } else if (query.dateOfBirthFrom) {
    conditions.push("dateOfBirth = ?");
    params.push(query.dateOfBirthFrom);
  } else if (query.dateOfBirthTo) {
    conditions.push("dateOfBirth = ?");
    params.push(query.dateOfBirthTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortFields = ["objectionNo", "fullName", "dateOfBirth", "reason"];
  const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "fullName";
  const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
  const limit = parseInt(query.maxRecords) || 5;
  const page = parseInt(query.page) || 1;
  const offset = (page - 1) * limit;

  const countParams = [...params];
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM no_objections ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<NoObjection[]>(
    `SELECT * FROM no_objections ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

export { create, getAll, getById, update, search };
