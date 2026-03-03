import "dotenv/config";
import app from "./app";
import initTables from "./config/initTables";

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await initTables();
    console.log("MySQL connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MySQL connection error:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

start();
