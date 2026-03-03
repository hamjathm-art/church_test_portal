"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const promise_1 = __importDefault(require("mysql2/promise"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function importAll() {
    const pool = promise_1.default.createPool({
        host: process.env.MYSQL_HOST || "localhost",
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "church_db",
    });
    const seedPath = path_1.default.join(__dirname, "seedData.json");
    const seedData = JSON.parse(fs_1.default.readFileSync(seedPath, "utf-8"));
    // Clear existing data (skip users — managed manually)
    await pool.query("SET FOREIGN_KEY_CHECKS = 0");
    await pool.query("TRUNCATE TABLE baptisms");
    await pool.query("TRUNCATE TABLE marriages");
    await pool.query("TRUNCATE TABLE confirmations");
    await pool.query("TRUNCATE TABLE burials");
    await pool.query("TRUNCATE TABLE no_objections");
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Cleared all tables (users untouched)");
    // Import baptisms
    const baptismFields = [
        "baptismNo", "dateOfBaptism", "dateOfBirth", "age", "fullName", "surname",
        "fatherName", "motherName", "fatherResidence", "fatherProfession", "nationality",
        "placeofBirth", "godfatherName", "godfatherSurname", "godfatherResidence",
        "godmotherName", "godmotherSurname", "godmotherResidence", "placeOfBaptism",
        "priestName", "remarks", "confirmedOn", "confirmedAt", "dateOfMarriage",
        "marriedTo", "placeOfMarriage",
    ];
    for (const b of seedData.baptisms) {
        const values = baptismFields.map((f) => b[f] || "");
        const placeholders = baptismFields.map(() => "?").join(", ");
        await pool.query(`INSERT INTO baptisms (${baptismFields.join(", ")}) VALUES (${placeholders})`, values);
    }
    console.log(`Baptisms: ${seedData.baptisms.length} imported`);
    // Import marriages
    const marriageFields = [
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
    for (const m of seedData.marriages) {
        const values = marriageFields.map((f) => m[f] || "");
        const placeholders = marriageFields.map(() => "?").join(", ");
        await pool.query(`INSERT INTO marriages (${marriageFields.join(", ")}) VALUES (${placeholders})`, values);
    }
    console.log(`Marriages: ${seedData.marriages.length} imported`);
    // Import confirmations
    const confirmationFields = [
        "fullName", "confirmationDate", "officiatingMinister", "sponsorName",
        "churchName", "churchAddress", "churchContact",
    ];
    for (const c of seedData.confirmations) {
        const values = confirmationFields.map((f) => c[f] || "");
        const placeholders = confirmationFields.map(() => "?").join(", ");
        await pool.query(`INSERT INTO confirmations (${confirmationFields.join(", ")}) VALUES (${placeholders})`, values);
    }
    console.log(`Confirmations: ${seedData.confirmations.length} imported`);
    // Import burials
    const burialFields = [
        "burialNo", "dateOfBurial", "fullName", "surname", "age", "nationality",
        "address", "profession", "relationship", "causeOfDeath", "lastSacraments",
        "dateOfDeath", "burialPlace", "minister", "remarks",
    ];
    const burialFieldNames = burialFields
        .map((f) => (f === "relationship" ? "`relationship`" : f))
        .join(", ");
    for (const b of seedData.burials) {
        const values = burialFields.map((f) => b[f] || "");
        const placeholders = burialFields.map(() => "?").join(", ");
        await pool.query(`INSERT INTO burials (${burialFieldNames}) VALUES (${placeholders})`, values);
    }
    console.log(`Burials: ${seedData.burials.length} imported`);
    // Import no objections
    const noObjFields = ["fullName", "dateOfBirth", "placeOfBirth", "reason", "recipientDetails"];
    for (const n of seedData.noObjections) {
        const values = noObjFields.map((f) => n[f] || "");
        const placeholders = noObjFields.map(() => "?").join(", ");
        await pool.query(`INSERT INTO no_objections (${noObjFields.join(", ")}) VALUES (${placeholders})`, values);
    }
    console.log(`NoObjections: ${seedData.noObjections.length} imported`);
    console.log("\nAll data imported successfully!");
    await pool.end();
}
importAll().catch((err) => {
    console.error("Import failed:", err instanceof Error ? err.message : err);
    process.exit(1);
});
//# sourceMappingURL=importData.js.map