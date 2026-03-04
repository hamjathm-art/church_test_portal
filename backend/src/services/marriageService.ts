import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { Marriage, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
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

const create = async (data: Record<string, string>): Promise<Marriage> => {
  data.marriageNo = await generateNextNumber("marriages", "marriageNo", "MG");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO marriages (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  return { id: result.insertId, ...Object.fromEntries(fields.map((f, i) => [f, values[i]])) } as Marriage;
};

const getAll = async (): Promise<Marriage[]> => {
  const [rows] = await pool.query<Marriage[]>("SELECT * FROM marriages ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<Marriage | null> => {
  const [rows] = await pool.query<Marriage[]>("SELECT * FROM marriages WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<Marriage | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE marriages SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  return { id: Number(id), ...Object.fromEntries(fields.map((f) => [f, data[f] !== undefined ? data[f] : ""])) } as Marriage;
};

const search = async (query: Record<string, string>): Promise<SearchResult<Marriage>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

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
  } else if (query.marriageDateFrom) {
    conditions.push("marriageDate = ?");
    params.push(query.marriageDateFrom);
  } else if (query.marriageDateTo) {
    conditions.push("marriageDate = ?");
    params.push(query.marriageDateTo);
  }

  if (query.groomDateOfBirthFrom && query.groomDateOfBirthTo) {
    conditions.push("groomDateOfBirth >= ? AND groomDateOfBirth <= ?");
    params.push(query.groomDateOfBirthFrom, query.groomDateOfBirthTo);
  } else if (query.groomDateOfBirthFrom) {
    conditions.push("groomDateOfBirth = ?");
    params.push(query.groomDateOfBirthFrom);
  } else if (query.groomDateOfBirthTo) {
    conditions.push("groomDateOfBirth = ?");
    params.push(query.groomDateOfBirthTo);
  }

  if (query.brideDateOfBirthFrom && query.brideDateOfBirthTo) {
    conditions.push("brideDateOfBirth >= ? AND brideDateOfBirth <= ?");
    params.push(query.brideDateOfBirthFrom, query.brideDateOfBirthTo);
  } else if (query.brideDateOfBirthFrom) {
    conditions.push("brideDateOfBirth = ?");
    params.push(query.brideDateOfBirthFrom);
  } else if (query.brideDateOfBirthTo) {
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
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM marriages ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<Marriage[]>(
    `SELECT * FROM marriages ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

export { create, getAll, getById, update, search };
