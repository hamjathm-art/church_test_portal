"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchBaptisms = exports.deleteBaptism = exports.updateBaptism = exports.getBaptismById = exports.getAllBaptisms = exports.createBaptism = void 0;
const baptismService = __importStar(require("../services/baptismService"));
const createBaptism = async (req, res) => {
    try {
        const saved = await baptismService.create(req.body);
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.createBaptism = createBaptism;
const getAllBaptisms = async (_req, res) => {
    try {
        const baptisms = await baptismService.getAll();
        res.status(200).json({ success: true, data: baptisms });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getAllBaptisms = getAllBaptisms;
const getBaptismById = async (req, res) => {
    try {
        const baptism = await baptismService.getById(req.params.id);
        if (!baptism) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: baptism });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getBaptismById = getBaptismById;
const updateBaptism = async (req, res) => {
    try {
        const baptism = await baptismService.update(req.params.id, req.body);
        if (!baptism) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: baptism });
    }
    catch (error) {
        if (error instanceof Error && error.name === "ValidationError") {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.updateBaptism = updateBaptism;
const searchBaptisms = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await baptismService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchBaptisms = searchBaptisms;
const deleteBaptism = async (req, res) => {
    try {
        const deleted = await baptismService.remove(req.params.id);
        if (!deleted) {
            res.status(404).json({ success: false, message: "Record not found" });
            return;
        }
        res.status(200).json({ success: true, message: "Baptism record deleted successfully" });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.deleteBaptism = deleteBaptism;
//# sourceMappingURL=baptismController.js.map