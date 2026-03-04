import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { Receipt, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
  "receiptNo", "dateOfReceipt", "receivedFrom", "familyCardNo",
  "amount", "towards", "details",
];

const create = async (data: Record<string, string>): Promise<Receipt> => {
  data.receiptNo = await generateNextNumber("receipts", "receiptNo", "RC");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO receipts (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  const [rows] = await pool.query<Receipt[]>("SELECT * FROM receipts WHERE id = ?", [result.insertId]);
  return rows[0];
};

const getAll = async (): Promise<Receipt[]> => {
  const [rows] = await pool.query<Receipt[]>("SELECT * FROM receipts ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<Receipt | null> => {
  const [rows] = await pool.query<Receipt[]>("SELECT * FROM receipts WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<Receipt | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE receipts SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query<Receipt[]>("SELECT * FROM receipts WHERE id = ?", [id]);
  return rows[0];
};

const search = async (query: Record<string, string>): Promise<SearchResult<Receipt>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.receiptNo) {
    conditions.push("receiptNo LIKE ?");
    params.push(`%${query.receiptNo}%`);
  }
  if (query.receivedFrom) {
    conditions.push("receivedFrom LIKE ?");
    params.push(`%${query.receivedFrom}%`);
  }
  if (query.familyCardNo) {
    conditions.push("familyCardNo LIKE ?");
    params.push(`%${query.familyCardNo}%`);
  }
  if (query.towards) {
    conditions.push("towards = ?");
    params.push(query.towards);
  }
  if (query.amount) {
    conditions.push("amount LIKE ?");
    params.push(`%${query.amount}%`);
  }

  if (query.dateOfReceiptFrom && query.dateOfReceiptTo) {
    conditions.push("dateOfReceipt >= ? AND dateOfReceipt <= ?");
    params.push(query.dateOfReceiptFrom, query.dateOfReceiptTo);
  } else if (query.dateOfReceiptFrom) {
    conditions.push("dateOfReceipt = ?");
    params.push(query.dateOfReceiptFrom);
  } else if (query.dateOfReceiptTo) {
    conditions.push("dateOfReceipt = ?");
    params.push(query.dateOfReceiptTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortFields = ["receivedFrom", "receiptNo", "dateOfReceipt", "amount"];
  const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "receivedFrom";
  const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
  const limit = parseInt(query.maxRecords) || 5;
  const page = parseInt(query.page) || 1;
  const offset = (page - 1) * limit;

  const countParams = [...params];
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM receipts ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<Receipt[]>(
    `SELECT * FROM receipts ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

export { create, getAll, getById, update, search };
