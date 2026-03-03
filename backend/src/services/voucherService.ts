import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { Voucher, CountRow, SearchResult } from "../types";

const fields: string[] = [
  "voucherNo", "voucherDate", "payTo", "debitAccount", "amount",
  "tds", "paymentMode", "chequeNumber", "details",
];

const create = async (data: Record<string, string>): Promise<Voucher> => {
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO vouchers (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  const [rows] = await pool.query<Voucher[]>("SELECT * FROM vouchers WHERE id = ?", [result.insertId]);
  return rows[0];
};

const getAll = async (): Promise<Voucher[]> => {
  const [rows] = await pool.query<Voucher[]>("SELECT * FROM vouchers ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<Voucher | null> => {
  const [rows] = await pool.query<Voucher[]>("SELECT * FROM vouchers WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<Voucher | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE vouchers SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query<Voucher[]>("SELECT * FROM vouchers WHERE id = ?", [id]);
  return rows[0];
};

const search = async (query: Record<string, string>): Promise<SearchResult<Voucher>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.voucherNo) {
    conditions.push("voucherNo LIKE ?");
    params.push(`%${query.voucherNo}%`);
  }
  if (query.payTo) {
    conditions.push("payTo LIKE ?");
    params.push(`%${query.payTo}%`);
  }
  if (query.debitAccount) {
    conditions.push("debitAccount = ?");
    params.push(query.debitAccount);
  }
  if (query.paymentMode) {
    conditions.push("paymentMode = ?");
    params.push(query.paymentMode);
  }
  if (query.chequeNumber) {
    conditions.push("chequeNumber LIKE ?");
    params.push(`%${query.chequeNumber}%`);
  }

  if (query.voucherDateFrom && query.voucherDateTo) {
    conditions.push("voucherDate >= ? AND voucherDate <= ?");
    params.push(query.voucherDateFrom, query.voucherDateTo);
  } else if (query.voucherDateFrom) {
    conditions.push("voucherDate = ?");
    params.push(query.voucherDateFrom);
  } else if (query.voucherDateTo) {
    conditions.push("voucherDate = ?");
    params.push(query.voucherDateTo);
  }

  if (query.amountFrom && query.amountTo) {
    conditions.push("CAST(amount AS UNSIGNED) >= ? AND CAST(amount AS UNSIGNED) <= ?");
    params.push(parseInt(query.amountFrom), parseInt(query.amountTo));
  } else if (query.amountFrom) {
    conditions.push("CAST(amount AS UNSIGNED) >= ?");
    params.push(parseInt(query.amountFrom));
  } else if (query.amountTo) {
    conditions.push("CAST(amount AS UNSIGNED) <= ?");
    params.push(parseInt(query.amountTo));
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortFields = ["voucherNo", "payTo", "voucherDate", "amount", "debitAccount"];
  const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "voucherNo";
  const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
  const limit = parseInt(query.maxRecords) || 100;
  const page = parseInt(query.page) || 1;
  const offset = (page - 1) * limit;

  const countParams = [...params];
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM vouchers ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<Voucher[]>(
    `SELECT * FROM vouchers ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

export { create, getAll, getById, update, search };
