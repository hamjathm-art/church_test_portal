import pool from "../config/db";
import { ResultSetHeader } from "mysql2";
import { Baptism, CountRow, SearchResult } from "../types";
import generateNextNumber from "../utils/numberGenerator";

const fields: string[] = [
  "baptismNo", "dateOfBaptism", "dateOfBirth", "age", "fullName", "surname",
  "fatherName", "motherName", "fatherResidence", "fatherProfession", "nationality",
  "placeofBirth", "godfatherName", "godfatherSurname", "godfatherResidence",
  "godmotherName", "godmotherSurname", "godmotherResidence", "placeOfBaptism",
  "priestName", "remarks", "confirmedOn", "confirmedAt", "dateOfMarriage",
  "marriedTo", "placeOfMarriage",
];

const create = async (data: Record<string, string>): Promise<Baptism> => {
  data.baptismNo = await generateNextNumber("baptisms", "baptismNo", "BP");
  const values = fields.map((f) => data[f] || "");
  const placeholders = fields.map(() => "?").join(", ");
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO baptisms (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  const [rows] = await pool.query<Baptism[]>("SELECT * FROM baptisms WHERE id = ?", [result.insertId]);
  return rows[0]; 
};

const getAll = async (): Promise<Baptism[]> => {
  const [rows] = await pool.query<Baptism[]>("SELECT * FROM baptisms ORDER BY created_at DESC");
  return rows;
};

const getById = async (id: string | number): Promise<Baptism | null> => {
  const [rows] = await pool.query<Baptism[]>("SELECT * FROM baptisms WHERE id = ?", [id]);
  return rows[0] || null;
};

const update = async (id: string | number, data: Record<string, string>): Promise<Baptism | null> => {
  const setClauses = fields.map((f) => `${f} = ?`).join(", ");
  const values: (string | number)[] = fields.map((f) => data[f] !== undefined ? data[f] : "");
  values.push(id);
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE baptisms SET ${setClauses} WHERE id = ?`,
    values
  );
  if (result.affectedRows === 0) return null;
  const [rows] = await pool.query<Baptism[]>("SELECT * FROM baptisms WHERE id = ?", [id]);
  return rows[0];
};

const search = async (query: Record<string, string>): Promise<SearchResult<Baptism>> => {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.baptismNo) {
    conditions.push("baptismNo LIKE ?");
    params.push(`%${query.baptismNo}%`);
  }
  if (query.fullName) {
    conditions.push("fullName LIKE ?");
    params.push(`%${query.fullName}%`);
  }
  if (query.surname) {
    conditions.push("surname LIKE ?");
    params.push(`%${query.surname}%`);
  }
  if (query.fatherName) {
    conditions.push("fatherName LIKE ?");
    params.push(`%${query.fatherName}%`);
  }
  if (query.motherName) {
    conditions.push("motherName LIKE ?");
    params.push(`%${query.motherName}%`);
  }

  if (query.dateOfBaptismFrom && query.dateOfBaptismTo) {
    conditions.push("dateOfBaptism >= ? AND dateOfBaptism <= ?");
    params.push(query.dateOfBaptismFrom, query.dateOfBaptismTo);
  } else if (query.dateOfBaptismFrom) {
    conditions.push("dateOfBaptism = ?");
    params.push(query.dateOfBaptismFrom);
  } else if (query.dateOfBaptismTo) {
    conditions.push("dateOfBaptism = ?");
    params.push(query.dateOfBaptismTo);
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

  if (query.confirmedOnFrom && query.confirmedOnTo) {
    conditions.push("confirmedOn >= ? AND confirmedOn <= ?");
    params.push(query.confirmedOnFrom, query.confirmedOnTo);
  } else if (query.confirmedOnFrom) {
    conditions.push("confirmedOn = ?");
    params.push(query.confirmedOnFrom);
  } else if (query.confirmedOnTo) {
    conditions.push("confirmedOn = ?");
    params.push(query.confirmedOnTo);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const allowedSortFields = ["baptismNo", "fullName", "surname", "dateOfBaptism", "dateOfBirth"];
  const sortField = allowedSortFields.includes(query.sortBy) ? query.sortBy : "baptismNo";
  const sortOrder = query.sortOrder === "desc" ? "DESC" : "ASC";
  const limit = parseInt(query.maxRecords) || 5;
  const page = parseInt(query.page) || 1;
  const offset = (page - 1) * limit;

  const countParams = [...params];
  const dataParams: (string | number)[] = [...params, limit, offset];

  const [countResult] = await pool.query<CountRow[]>(
    `SELECT COUNT(*) as total FROM baptisms ${whereClause}`,
    countParams
  );
  const [data] = await pool.query<Baptism[]>(
    `SELECT * FROM baptisms ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`,
    dataParams
  );

  return { data, totalCount: countResult[0].total, page, limit };
};

const remove = async (id: string | number): Promise<boolean> => {
  const [result] = await pool.query<ResultSetHeader>("DELETE FROM baptisms WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

export { create, getAll, getById, update, remove, search };
