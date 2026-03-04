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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextBurialNumber = exports.searchBurials = exports.getBurialById = exports.updateBurial = exports.getAllBurials = exports.createBurial = void 0;
const burialService = __importStar(require("../services/burialService"));
const numberGenerator_1 = __importDefault(require("../utils/numberGenerator"));
const createBurial = async (req, res) => {
    try {
        const saved = await burialService.create(req.body);
        res.status(201).json({ success: true, data: saved });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(400).json({ success: false, message: "Server error" });
    }
};
exports.createBurial = createBurial;
const getAllBurials = async (_req, res) => {
    try {
        const data = await burialService.getAll();
        res.json({ success: true, data });
    }
    catch {
        res.status(500).json({ success: false });
    }
};
exports.getAllBurials = getAllBurials;
const updateBurial = async (req, res) => {
    try {
        const updated = await burialService.update(req.params.id, req.body);
        res.json({ success: true, data: updated });
    }
    catch {
        res.status(400).json({ success: false });
    }
};
exports.updateBurial = updateBurial;
const getBurialById = async (req, res) => {
    try {
        const burial = await burialService.getById(req.params.id);
        if (!burial) {
            res.status(404).json({ success: false, message: "Not found" });
            return;
        }
        res.status(200).json({ success: true, data: burial });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getBurialById = getBurialById;
const searchBurials = async (req, res) => {
    try {
        const { data, totalCount, page, limit } = await burialService.search(req.query);
        const totalPages = Math.ceil(totalCount / limit);
        res.status(200).json({ success: true, data, totalCount, page, totalPages });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.searchBurials = searchBurials;
const getNextBurialNumber = async (_req, res) => {
    try {
        const nextNumber = await (0, numberGenerator_1.default)("burials", "burialNo", "BL");
        res.status(200).json({ success: true, data: { nextNumber } });
    }
    catch {
        res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.getNextBurialNumber = getNextBurialNumber;
//# sourceMappingURL=burialController.js.map