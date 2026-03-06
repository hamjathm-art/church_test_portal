import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { ParishRequest, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
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

const create = async (data: Record<string, string>): Promise<ParishRequest> => {
  data.requestNo = await generateNextNumber("parish_requests", "requestNo", "PR");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO parish_requests (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  return { id: result.insertId, ...Object.fromEntries(fields.map((f, i) => [f, values[i]])) } as ParishRequest;
};

const getAll = async (): Promise<ParishRequest[]> => {
  const [rows] = await pool.query<ParishRequest[]>("SELECT * FROM parish_requests ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<ParishRequest | null> => {
  const [rows] = await pool.query<ParishRequest[]>("SELECT * FROM parish_requests WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<ParishRequest | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE parish_requests SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return { id: Number(id), ...Object.fromEntries(fields.map((f) => [f, data[f] !== undefined ? data[f] : ""])) } as ParishRequest;
};

const search = async (query: Record<string, string>): Promise<SearchResult<ParishRequest>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.requestNo) {
    conditions.push("requestNo LIKE ?");
    params.push(`%${query.requestNo}%`);
  }
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
  } else if (query.dateReceivedFrom) {
    conditions.push("dateReceived = ?");
    params.push(query.dateReceivedFrom);
  } else if (query.dateReceivedTo) {
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
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM parish_requests ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<ParishRequest[]>(
    `SELECT * FROM parish_requests ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

const remove = async (id: string | number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM parish_requests WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export { create, getAll, getById, update, remove, search };
