const mongoose = require("mongoose");
require("dotenv").config();

const Baptism = require("../models/Baptism");
const Marriage = require("../models/Marriage");
const Confirmation = require("../models/Confirmation");
const Burial = require("../models/Burial");
const NoObjection = require("../models/NoObjection");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/church_db";

async function exportAll() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  const baptisms = await Baptism.find().lean();
  const marriages = await Marriage.find().lean();
  const confirmations = await Confirmation.find().lean();
  const burials = await Burial.find().lean();
  const noObjections = await NoObjection.find().lean();
  const users = await User.find().lean();

  const seedData = {
    baptisms,
    marriages,
    confirmations,
    burials,
    noObjections,
    users,
  };

  const outPath = path.join(__dirname, "seedData.json");
  fs.writeFileSync(outPath, JSON.stringify(seedData, null, 2));

  console.log(`Exported:`);
  console.log(`  Baptisms: ${baptisms.length}`);
  console.log(`  Marriages: ${marriages.length}`);
  console.log(`  Confirmations: ${confirmations.length}`);
  console.log(`  Burials: ${burials.length}`);
  console.log(`  NoObjections: ${noObjections.length}`);
  console.log(`  Users: ${users.length}`);
  console.log(`Saved to: ${outPath}`);

  await mongoose.disconnect();
}

exportAll().catch((err) => {
  console.error("Export failed:", err.message);
  process.exit(1);
});
