"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const initTables_1 = __importDefault(require("./config/initTables"));
const PORT = process.env.PORT || 5000;
async function start() {
    try {
        await (0, initTables_1.default)();
        console.log("MySQL connected successfully");
        app_1.default.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error("MySQL connection error:", err instanceof Error ? err.message : err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map