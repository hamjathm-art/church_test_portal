const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const toMysqlDate = (isoStr) => {
  if (!isoStr) return null;
  return isoStr.replace("T", " ").replace("Z", "").split(".")[0];
};

async function importAll() {
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "church_db",
  });

  const seedPath = path.join(__dirname, "seedData.json");
  const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

  // Import users
  for (const u of seedData.users) {
    await pool.query(
      "INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [
        u.name,
        u.email,
        u.password,
        toMysqlDate(u.createdAt),
        toMysqlDate(u.updatedAt),
      ]
    );
  }
  console.log(`Users: ${seedData.users.length} imported`);

  // Import baptisms
  const baptismFields = [
    "baptismNo",
    "dateOfBaptism",
    "dateOfBirth",
    "age",
    "fullName",
    "surname",
    "fatherName",
    "motherName",
    "fatherResidence",
    "fatherProfession",
    "nationality",
    "placeofBirth",
    "godfatherName",
    "godfatherSurname",
    "godfatherResidence",
    "godmotherName",
    "godmotherSurname",
    "godmotherResidence",
    "placeOfBaptism",
    "priestName",
    "remarks",
    "confirmedOn",
    "confirmedAt",
    "dateOfMarriage",
    "marriedTo",
    "placeOfMarriage",
  ];
  for (const b of seedData.baptisms) {
    const values = baptismFields.map((f) => b[f] || "");
    values.push(toMysqlDate(b.createdAt), toMysqlDate(b.updatedAt));
    const placeholders = [...baptismFields, "created_at", "updated_at"]
      .map(() => "?")
      .join(", ");
    await pool.query(
      `INSERT INTO baptisms (${baptismFields.join(
        ", "
      )}, created_at, updated_at) VALUES (${placeholders})`,
      values
    );
  }
  console.log(`Baptisms: ${seedData.baptisms.length} imported`);

  // Import marriages
  const marriageFields = [
    "marriageNo",
    "marriageDate",
    "marriagePlace",
    "groomName",
    "groomSurname",
    "groomFatherName",
    "groomMotherName",
    "groomDateOfBirth",
    "groomAge",
    "groomChurchOfBaptism",
    "groomNationality",
    "groomAddress",
    "groomProfession",
    "groomMaritalStatus",
    "groomIfWidowerWhose",
    "brideName",
    "brideSurname",
    "brideFatherName",
    "brideMotherName",
    "brideDateOfBirth",
    "brideAge",
    "brideChurchOfBaptism",
    "brideNationality",
    "brideAddress",
    "brideProfession",
    "brideMaritalStatus",
    "brideIfWidowWhose",
    "dateOfFirstBanns",
    "dateOfSecondBanns",
    "dispensation",
    "firstWitnessName",
    "firstWitnessSurname",
    "firstWitnessAddress",
    "secondWitnessName",
    "secondWitnessSurname",
    "secondWitnessAddress",
    "minister",
    "remarks",
  ];
  for (const m of seedData.marriages) {
    const values = marriageFields.map((f) => m[f] || "");
    values.push(toMysqlDate(m.createdAt), toMysqlDate(m.updatedAt));
    const placeholders = [...marriageFields, "created_at", "updated_at"]
      .map(() => "?")
      .join(", ");
    await pool.query(
      `INSERT INTO marriages (${marriageFields.join(
        ", "
      )}, created_at, updated_at) VALUES (${placeholders})`,
      values
    );
  }
  console.log(`Marriages: ${seedData.marriages.length} imported`);

  // Import confirmations
  const confirmationFields = [
    "fullName",
    "confirmationDate",
    "officiatingMinister",
    "sponsorName",
    "churchName",
    "churchAddress",
    "churchContact",
  ];
  for (const c of seedData.confirmations) {
    const values = confirmationFields.map((f) => c[f] || "");
    values.push(toMysqlDate(c.createdAt), toMysqlDate(c.updatedAt));
    const placeholders = [...confirmationFields, "created_at", "updated_at"]
      .map(() => "?")
      .join(", ");
    await pool.query(
      `INSERT INTO confirmations (${confirmationFields.join(
        ", "
      )}, created_at, updated_at) VALUES (${placeholders})`,
      values
    );
  }
  console.log(`Confirmations: ${seedData.confirmations.length} imported`);

  // Import burials
  const burialFields = [
    "burialNo",
    "dateOfBurial",
    "fullName",
    "surname",
    "age",
    "nationality",
    "address",
    "profession",
    "relationship",
    "causeOfDeath",
    "lastSacraments",
    "dateOfDeath",
    "burialPlace",
    "minister",
    "remarks",
  ];
  const burialFieldNames = burialFields
    .map((f) => (f === "relationship" ? "`relationship`" : f))
    .join(", ");
  for (const b of seedData.burials) {
    const values = burialFields.map((f) => b[f] || "");
    values.push(toMysqlDate(b.createdAt), toMysqlDate(b.updatedAt));
    const placeholders = [...burialFields, "created_at", "updated_at"]
      .map(() => "?")
      .join(", ");
    await pool.query(
      `INSERT INTO burials (${burialFieldNames}, created_at, updated_at) VALUES (${placeholders})`,
      values
    );
  }
  console.log(`Burials: ${seedData.burials.length} imported`);

  // Import no objections
  const noObjFields = [
    "fullName",
    "dateOfBirth",
    "placeOfBirth",
    "reason",
    "recipientDetails",
  ];
  for (const n of seedData.noObjections) {
    const values = noObjFields.map((f) => n[f] || "");
    values.push(toMysqlDate(n.createdAt), toMysqlDate(n.updatedAt));
    const placeholders = [...noObjFields, "created_at", "updated_at"]
      .map(() => "?")
      .join(", ");
    await pool.query(
      `INSERT INTO no_objections (${noObjFields.join(
        ", "
      )}, created_at, updated_at) VALUES (${placeholders})`,
      values
    );
  }
  console.log(`NoObjections: ${seedData.noObjections.length} imported`);

  console.log("\nAll data imported successfully!");
  await pool.end();
}

importAll().catch((err) => {
  console.error("Import failed:", err.message);
  process.exit(1);
});
