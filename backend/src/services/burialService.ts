import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { Burial, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
  "burialNo", "dateOfBurial", "fullName", "surname", "age", "nationality",
  "address", "profession", "relationship", "causeOfDeath", "lastSacraments",
  "dateOfDeath", "burialPlace", "minister", "remarks",
];

const escapeField = (f: string): string => (f === "relationship" ? "`relationship`" : f);

const create = async (data: Record<string, string>): Promise<Burial> => {
  data.burialNo = await generateNextNumber("burials", "burialNo", "BL");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const fieldNames = fields.map(escapeField).join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO burials (${fieldNames}) VALUES (${placeholders})`,
    values
  );
  return { id: result.insertId, ...Object.fromEntries(fields.map((f, i) => [f, values[i]])) } as Burial;
};

const getAll = async (): Promise<Burial[]> => {
  const [rows] = await pool.query<Burial[]>("SELECT * FROM burials ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<Burial | null> => {
  const [rows] = await pool.query<Burial[]>("SELECT * FROM burials WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<Burial | null> => {
  const setClauses = fields.map((f) => `${escapeField(f)} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE burials SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return { id: Number(id), ...Object.fromEntries(fields.map((f) => [f, data[f] !== undefined ? data[f] : ""])) } as Burial;
};

const search = async (query: Record<string, string>): Promise<SearchResult<Burial>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

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
  } else if (query.dateOfBurialFrom) {
    conditions.push("dateOfBurial = ?");
    params.push(query.dateOfBurialFrom);
  } else if (query.dateOfBurialTo) {
    conditions.push("dateOfBurial = ?");
    params.push(query.dateOfBurialTo);
  }

  // Date of Death range
  if (query.dateOfDeathFrom && query.dateOfDeathTo) {
    conditions.push("dateOfDeath >= ? AND dateOfDeath <= ?");
    params.push(query.dateOfDeathFrom, query.dateOfDeathTo);
  } else if (query.dateOfDeathFrom) {
    conditions.push("dateOfDeath = ?");
    params.push(query.dateOfDeathFrom);
  } else if (query.dateOfDeathTo) {
    conditions.push("dateOfDeath = ?");
    params.push(query.dateOfDeathTo);
  }

  // Age range
  if (query.ageFrom && query.ageTo) {
    conditions.push("CAST(age AS UNSIGNED) >= ? AND CAST(age AS UNSIGNED) <= ?");
    params.push(parseInt(query.ageFrom), parseInt(query.ageTo));
  } else if (query.ageFrom) {
    conditions.push("CAST(age AS UNSIGNED) >= ?");
    params.push(parseInt(query.ageFrom));
  } else if (query.ageTo) {
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
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM burials ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<Burial[]>(
    `SELECT * FROM burials ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

export { create, getAll, getById, update, search };
