import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { Confirmation, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
  "confirmationNo", "fullName", "confirmationDate", "officiatingMinister", "sponsorName",
  "churchName", "churchAddress", "churchContact",
];

const create = async (data: Record<string, string>): Promise<Confirmation> => {
  data.confirmationNo = await generateNextNumber("confirmations", "confirmationNo", "CF");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO confirmations (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  return { id: result.insertId, ...Object.fromEntries(fields.map((f, i) => [f, values[i]])) } as Confirmation;
};

const getAll = async (): Promise<Confirmation[]> => {
  const [rows] = await pool.query<Confirmation[]>("SELECT * FROM confirmations ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<Confirmation | null> => {
  const [rows] = await pool.query<Confirmation[]>("SELECT * FROM confirmations WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<Confirmation | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE confirmations SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return { id: Number(id), ...Object.fromEntries(fields.map((f) => [f, data[f] !== undefined ? data[f] : ""])) } as Confirmation;
};

const search = async (query: Record<string, string>): Promise<SearchResult<Confirmation>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.confirmationNo) {
    conditions.push("confirmationNo LIKE ?");
    params.push(`%${query.confirmationNo}%`);
  }
  if (query.fullName) {
    conditions.push("fullName LIKE ?");
    params.push(`%${query.fullName}%`);
  }
  if (query.officiatingMinister) {
    conditions.push("officiatingMinister LIKE ?");
    params.push(`%${query.officiatingMinister}%`);
  }
  if (query.churchName) {
    conditions.push("churchName LIKE ?");
    params.push(`%${query.churchName}%`);
  }
  if (query.churchAddress) {
    conditions.push("churchAddress LIKE ?");
    params.push(`%${query.churchAddress}%`);
  }

  if (query.confirmationDateFrom && query.confirmationDateTo) {
    conditions.push("confirmationDate >= ? AND confirmationDate <= ?");
    params.push(query.confirmationDateFrom, query.confirmationDateTo);
  } else if (query.confirmationDateFrom) {
    conditions.push("confirmationDate = ?");
    params.push(query.confirmationDateFrom);
  } else if (query.confirmationDateTo) {
    conditions.push("confirmationDate = ?");
    params.push(query.confirmationDateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortFields = ["confirmationNo", "fullName", "confirmationDate", "officiatingMinister", "churchName"];
  const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "fullName";
  const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
  const limit = parseInt(query.maxRecords) || 5;
  const page = parseInt(query.page) || 1;
  const offset = (page - 1) * limit;

  const countParams = [...params];
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM confirmations ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<Confirmation[]>(
    `SELECT * FROM confirmations ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

export { create, getAll, getById, update, search };
