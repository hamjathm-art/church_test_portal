import pool from "../config/db";
import { RowDataPacket } from "mysql2";

interface NumberRow extends RowDataPacket {
  lastNumber: string;
}

const generateNextNumber = async (
  tableName: string,
  fieldName: string, 
  prefix: string
): Promise<string> => {
  const [rows] = await pool.query<NumberRow[]>(
    `SELECT ${fieldName} as lastNumber FROM ${tableName} WHERE ${fieldName} LIKE ? ORDER BY ${fieldName} DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNum = 1;
  if (rows.length > 0 && rows[0].lastNumber) {
    const numPart = rows[0].lastNumber.replace(prefix, "");
    const parsed = parseInt(numPart, 10);
    if (!isNaN(parsed)) {
      nextNum = parsed + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
};

export default generateNextNumber;
