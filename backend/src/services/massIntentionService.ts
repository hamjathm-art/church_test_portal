import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { MassIntention, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
  "intentionNo", "fullName", "contactNumber", "emailAddress",
  "typeOfIntention", "otherIntention", "nameOfPersonForIntention", "intentionDetails",
  "slot1Date", "slot1Status", "slot2Date", "slot2Status",
  "slot3Date", "slot3Status", "slot4Date", "slot4Status",
  "preferredDateTime",
  "offeringAmount", "paymentStatus", "paymentMode", "bankName", "accountNumber", "ifscCode", "referenceNumber",
  "specialNotes", "status",
  "receivedBy", "receivedDate", "confirmedDateTime", "paymentReceived", "receiptNo",
];

const create = async (data: Record<string, string>): Promise<MassIntention> => {
  data.intentionNo = await generateNextNumber("mass_intentions", "intentionNo", "MI");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO mass_intentions (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  return { id: result.insertId, ...Object.fromEntries(fields.map((f, i) => [f, values[i]])) } as MassIntention;
};

const getAll = async (): Promise<MassIntention[]> => {
  const [rows] = await pool.query<MassIntention[]>("SELECT * FROM mass_intentions ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<MassIntention | null> => {
  const [rows] = await pool.query<MassIntention[]>("SELECT * FROM mass_intentions WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<MassIntention | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE mass_intentions SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return { id: Number(id), ...Object.fromEntries(fields.map((f) => [f, data[f] !== undefined ? data[f] : ""])) } as MassIntention;
};

const search = async (query: Record<string, string>): Promise<SearchResult<MassIntention>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.fullName) {
    conditions.push("fullName LIKE ?");
    params.push(`%${query.fullName}%`);
  }
  if (query.contactNumber) {
    conditions.push("contactNumber LIKE ?");
    params.push(`%${query.contactNumber}%`);
  }
  if (query.typeOfIntention) {
    conditions.push("typeOfIntention = ?");
    params.push(query.typeOfIntention);
  }
  if (query.status) {
    conditions.push("status = ?");
    params.push(query.status);
  }

  if (query.receivedDateFrom && query.receivedDateTo) {
    conditions.push("receivedDate >= ? AND receivedDate <= ?");
    params.push(query.receivedDateFrom, query.receivedDateTo);
  } else if (query.receivedDateFrom) {
    conditions.push("receivedDate = ?");
    params.push(query.receivedDateFrom);
  } else if (query.receivedDateTo) {
    conditions.push("receivedDate = ?");
    params.push(query.receivedDateTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortFields = ["fullName", "typeOfIntention", "status", "receivedDate", "created_at"];
  const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "created_at";
  const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
  const limit = parseInt(query.maxRecords) || 5;
  const page = parseInt(query.page) || 1;
  const offset = (page - 1) * limit;

  const countParams = [...params];
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM mass_intentions ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<MassIntention[]>(
    `SELECT * FROM mass_intentions ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

const checkAvailability = async (
  dates: Record<string, string>,
  excludeId?: string | number
): Promise<Record<string, boolean>> => {
  const result: Record<string, boolean> = {};

  for (let i = 1; i <= 4; i++) {
    const date = dates[`slot${i}Date`];
    if (date) {
      let query = `SELECT COUNT(*) as total FROM mass_intentions WHERE slot${i}Date = ? AND slot${i}Status != ''`;
      const params: (string | number)[] = [date];
      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }
      const [rows] = await pool.query<CountRow[]>(query, params);
      result[`slot${i}`] = rows[0].total > 0;
    } else {
      result[`slot${i}`] = false;
    }
  }

  return result;
};

const remove = async (id: string | number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM mass_intentions WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export { create, getAll, getById, update, remove, search, checkAvailability };
